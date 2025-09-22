-- ============================================================================
-- Job Portal Database - Performance Monitoring & Maintenance
-- Queries and procedures for ongoing database health monitoring
-- ============================================================================

-- ============================================================================
-- Performance Monitoring Queries
-- ============================================================================

-- === Query Performance Analysis ===

-- Most time-consuming queries
SELECT 
    query,
    calls,
    total_time,
    round(mean_time::numeric, 2) as avg_time_ms,
    round((100 * total_time / sum(total_time) OVER ())::numeric, 2) as percent_total_time,
    rows,
    round((rows / calls)::numeric, 2) as rows_per_call
FROM pg_stat_statements 
WHERE calls > 10
ORDER BY mean_time DESC
LIMIT 20;

-- Queries with highest I/O usage
SELECT 
    query,
    calls,
    shared_blks_read,
    shared_blks_hit,
    round((shared_blks_read * 100.0 / (shared_blks_hit + shared_blks_read))::numeric, 2) as cache_miss_percent,
    temp_blks_read,
    temp_blks_written
FROM pg_stat_statements 
WHERE shared_blks_read > 0
ORDER BY shared_blks_read DESC
LIMIT 20;

-- === Table and Index Usage Analysis ===

-- Table sizes and usage statistics
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    round((n_dead_tup * 100.0 / GREATEST(n_live_tup + n_dead_tup, 1))::numeric, 2) as dead_row_percent,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables psu
JOIN pg_tables pt ON psu.relname = pt.tablename
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage and efficiency
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    CASE 
        WHEN idx_scan = 0 THEN 'Never used'
        WHEN idx_tup_read = 0 THEN 'Index only scans'
        ELSE round((idx_tup_fetch::numeric / idx_tup_read * 100), 2)::text || '%'
    END as efficiency
FROM pg_stat_user_indexes
JOIN pg_indexes USING (schemaname, tablename, indexname)
WHERE schemaname = 'public'
ORDER BY idx_scan DESC, pg_relation_size(indexrelid) DESC;

-- Unused indexes (potential candidates for removal)
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
  AND idx_scan < 10
  AND pg_relation_size(indexrelid) > 1024 * 1024 -- larger than 1MB
ORDER BY pg_relation_size(indexrelid) DESC;

-- === Connection and Activity Monitoring ===

-- Current active connections and queries
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    NOW() - query_start as duration,
    query
FROM pg_stat_activity 
WHERE state != 'idle' 
  AND query != '<IDLE>'
  AND pid != pg_backend_pid()
ORDER BY query_start;

-- Long-running queries (over 5 minutes)
SELECT 
    pid,
    usename,
    state,
    NOW() - query_start as duration,
    query
FROM pg_stat_activity 
WHERE NOW() - query_start > INTERVAL '5 minutes'
  AND state != 'idle'
  AND pid != pg_backend_pid();

-- === Lock Analysis ===

-- Current locks and blocking queries
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- ============================================================================
-- Application-Specific Performance Queries
-- ============================================================================

-- === Job Portal Specific Metrics ===

-- User activity summary
SELECT 
    'Total Users' as metric,
    COUNT(*) as count,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as last_30_days
FROM users
UNION ALL
SELECT 
    'Active Jobs',
    COUNT(*),
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END),
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END)
FROM jobs WHERE is_active = TRUE
UNION ALL
SELECT 
    'Applications',
    COUNT(*),
    COUNT(CASE WHEN submitted_at > NOW() - INTERVAL '7 days' THEN 1 END),
    COUNT(CASE WHEN submitted_at > NOW() - INTERVAL '30 days' THEN 1 END)
FROM applications
UNION ALL
SELECT 
    'Successful Payments',
    COUNT(*),
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END),
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END)
FROM payments WHERE status = 'succeeded';

-- Skill matching performance metrics
SELECT 
    'Skill Match View Size' as metric,
    COUNT(*) as total_combinations,
    COUNT(CASE WHEN meets_mandatory_requirements THEN 1 END) as qualified_matches,
    ROUND(AVG(weighted_match_percentage), 2) as avg_match_score
FROM mv_applicant_skill_match;

-- Most popular job search criteria
SELECT 
    'Top Locations' as category,
    location as value,
    COUNT(*) as frequency
FROM jobs 
WHERE location IS NOT NULL 
  AND is_active = TRUE
GROUP BY location
ORDER BY COUNT(*) DESC
LIMIT 10;

-- Resume builder usage
SELECT 
    template_name,
    COUNT(*) as usage_count,
    COUNT(CASE WHEN updated_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_updates,
    ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600), 2) as avg_edit_hours
FROM resumes
GROUP BY template_name
ORDER BY usage_count DESC;

-- ============================================================================
-- Automated Health Checks
-- ============================================================================

-- Function to check database health
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT,
    action_required BOOLEAN
) AS $$
BEGIN
    -- Check for tables needing VACUUM
    RETURN QUERY
    SELECT 
        'High Dead Tuple Ratio' as check_name,
        CASE WHEN dead_percent > 20 THEN 'WARNING' ELSE 'OK' END as status,
        tablename || ': ' || dead_percent::text || '% dead tuples' as details,
        dead_percent > 20 as action_required
    FROM (
        SELECT 
            tablename,
            ROUND((n_dead_tup * 100.0 / GREATEST(n_live_tup + n_dead_tup, 1))::numeric, 2) as dead_percent
        FROM pg_stat_user_tables
        WHERE schemaname = 'public' AND n_live_tup > 1000
    ) t
    WHERE dead_percent > 10;

    -- Check for unused indexes
    RETURN QUERY
    SELECT 
        'Unused Large Index' as check_name,
        'WARNING' as status,
        indexname || ' on ' || tablename || ' (' || pg_size_pretty(pg_relation_size(indexrelid)) || ', ' || idx_scan || ' scans)' as details,
        TRUE as action_required
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public' 
      AND idx_scan < 10
      AND pg_relation_size(indexrelid) > 10 * 1024 * 1024; -- larger than 10MB

    -- Check materialized view freshness
    RETURN QUERY
    SELECT 
        'Stale Materialized View' as check_name,
        CASE WHEN age_hours > 24 THEN 'WARNING' ELSE 'OK' END as status,
        'mv_applicant_skill_match is ' || age_hours::text || ' hours old' as details,
        age_hours > 24 as action_required
    FROM (
        SELECT EXTRACT(EPOCH FROM (NOW() - calculated_at))/3600 as age_hours
        FROM mv_applicant_skill_match
        LIMIT 1
    ) t;

    -- Check for long-running queries
    RETURN QUERY
    SELECT 
        'Long Running Query' as check_name,
        'WARNING' as status,
        'PID ' || pid::text || ' running for ' || EXTRACT(EPOCH FROM duration)::int::text || ' seconds' as details,
        TRUE as action_required
    FROM (
        SELECT pid, NOW() - query_start as duration
        FROM pg_stat_activity 
        WHERE NOW() - query_start > INTERVAL '10 minutes'
          AND state != 'idle'
          AND pid != pg_backend_pid()
    ) t;

END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Maintenance Procedures
-- ============================================================================

-- Comprehensive maintenance function
CREATE OR REPLACE FUNCTION run_comprehensive_maintenance(
    p_vacuum_analyze BOOLEAN DEFAULT TRUE,
    p_refresh_views BOOLEAN DEFAULT TRUE,
    p_cleanup_logs BOOLEAN DEFAULT TRUE
) RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    maintenance_start TIMESTAMP := NOW();
BEGIN
    result := 'Maintenance started at ' || maintenance_start::text || E'\n';

    -- 1. Vacuum and Analyze if requested
    IF p_vacuum_analyze THEN
        result := result || 'Running VACUUM ANALYZE...' || E'\n';
        VACUUM ANALYZE;
        result := result || 'VACUUM ANALYZE completed' || E'\n';
    END IF;

    -- 2. Refresh materialized views if requested  
    IF p_refresh_views THEN
        result := result || 'Refreshing materialized views...' || E'\n';
        BEGIN
            REFRESH MATERIALIZED VIEW CONCURRENTLY mv_applicant_skill_match;
            REFRESH MATERIALIZED VIEW CONCURRENTLY mv_company_analytics;
            REFRESH MATERIALIZED VIEW CONCURRENTLY mv_skills_analytics;
            result := result || 'All materialized views refreshed' || E'\n';
        EXCEPTION WHEN OTHERS THEN
            result := result || 'Error refreshing views: ' || SQLERRM || E'\n';
        END;
    END IF;

    -- 3. Clean up old logs if requested
    IF p_cleanup_logs THEN
        result := result || 'Cleaning up old system logs...' || E'\n';
        DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '3 months';
        result := result || 'Old logs cleaned up' || E'\n';
    END IF;

    -- 4. Update expired referrals
    result := result || 'Updating expired referrals...' || E'\n';
    UPDATE referrals 
    SET status = 'Expired', 
        reward_status = 'Forfeited',
        updated_at = NOW()
    WHERE expires_at < NOW() 
      AND status = 'Pending';
    result := result || 'Expired referrals updated: ' || ROW_COUNT || E'\n';

    -- 5. Generate statistics
    result := result || 'Collecting database statistics...' || E'\n';
    PERFORM pg_stat_reset();
    
    -- Log the maintenance completion
    INSERT INTO system_logs (log_type, message, created_at) 
    VALUES ('maintenance', 'Comprehensive maintenance completed: ' || EXTRACT(EPOCH FROM (NOW() - maintenance_start))::int || ' seconds', NOW());

    result := result || 'Maintenance completed at ' || NOW()::text;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to optimize specific table
CREATE OR REPLACE FUNCTION optimize_table(p_table_name TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    result := 'Optimizing table: ' || p_table_name || E'\n';
    
    -- Vacuum and analyze the specific table
    EXECUTE 'VACUUM ANALYZE ' || p_table_name;
    result := result || 'VACUUM ANALYZE completed' || E'\n';
    
    -- Reindex the table
    EXECUTE 'REINDEX TABLE ' || p_table_name;
    result := result || 'REINDEX completed' || E'\n';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Performance Alerts and Notifications
-- ============================================================================

-- Function to check for performance issues and return alerts
CREATE OR REPLACE FUNCTION get_performance_alerts()
RETURNS TABLE (
    alert_type TEXT,
    severity TEXT,
    message TEXT,
    recommended_action TEXT
) AS $$
BEGIN
    -- Alert for high dead tuple ratio
    RETURN QUERY
    SELECT 
        'Dead Tuples' as alert_type,
        'High' as severity,
        tablename || ' has ' || dead_percent::text || '% dead tuples' as message,
        'Run VACUUM on ' || tablename as recommended_action
    FROM (
        SELECT 
            tablename,
            ROUND((n_dead_tup * 100.0 / GREATEST(n_live_tup + n_dead_tup, 1))::numeric, 2) as dead_percent
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
    ) t
    WHERE dead_percent > 25;

    -- Alert for slow queries
    RETURN QUERY
    SELECT 
        'Slow Query' as alert_type,
        'Medium' as severity,
        'Query taking average ' || round(mean_time::numeric, 2)::text || 'ms with ' || calls || ' calls' as message,
        'Consider optimizing or adding indexes' as recommended_action
    FROM pg_stat_statements 
    WHERE mean_time > 1000 -- queries taking more than 1 second
      AND calls > 10
    ORDER BY mean_time DESC
    LIMIT 5;

    -- Alert for lock contention
    RETURN QUERY
    SELECT 
        'Lock Contention' as alert_type,
        'High' as severity,
        'PID ' || blocked_locks.pid::text || ' blocked by PID ' || blocking_locks.pid::text as message,
        'Check for long-running transactions' as recommended_action
    FROM pg_catalog.pg_locks blocked_locks
    JOIN pg_catalog.pg_locks blocking_locks ON (
        blocking_locks.locktype = blocked_locks.locktype AND
        blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database AND
        blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation AND
        blocking_locks.pid != blocked_locks.pid
    )
    WHERE NOT blocked_locks.granted;

END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Backup and Recovery Helpers
-- ============================================================================

-- Function to get backup status information
CREATE OR REPLACE FUNCTION get_backup_info()
RETURNS TABLE (
    info_type TEXT,
    value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Database Size' as info_type,
        pg_size_pretty(pg_database_size(current_database())) as value
    UNION ALL
    SELECT 
        'Last Checkpoint',
        checkpoint_time::text
    FROM pg_stat_bgwriter, pg_control_checkpoint()
    UNION ALL
    SELECT 
        'WAL Files',
        COUNT(*)::text
    FROM pg_ls_waldir()
    UNION ALL
    SELECT 
        'Connection Count',
        COUNT(*)::text
    FROM pg_stat_activity;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Scheduled Maintenance Script Template
-- ============================================================================

/*
-- Example cron job or scheduled task to run maintenance
-- This would be executed by your application scheduler or cron job

-- Daily maintenance (run at 2 AM)
SELECT run_comprehensive_maintenance(
    p_vacuum_analyze := TRUE,
    p_refresh_views := TRUE,
    p_cleanup_logs := FALSE
);

-- Weekly maintenance (run on Sundays at 3 AM)
SELECT run_comprehensive_maintenance(
    p_vacuum_analyze := TRUE,
    p_refresh_views := TRUE,
    p_cleanup_logs := TRUE
);

-- Check for alerts (run every hour)
SELECT * FROM get_performance_alerts();

-- Health check (run every 6 hours)  
SELECT * FROM check_database_health() WHERE action_required = TRUE;
*/