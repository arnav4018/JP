'use client';

// Classic Template
export const ClassicTemplate = ({ resumeData }) => {
  const { personalInfo, education, experience, skills, projects, certifications, awards } = resumeData;
  
  return (
    <div className="classic-template" style={{
      fontFamily: 'Times New Roman, serif',
      lineHeight: '1.4',
      color: '#333',
      maxWidth: '8.5in',
      minHeight: '11in',
      padding: '0.75in',
      backgroundColor: 'white',
      fontSize: '11pt'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '24pt', fontWeight: 'bold' }}>
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <div style={{ fontSize: '10pt', color: '#666' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span> | {personalInfo.phone}</span>}
          {personalInfo.address && <span> | {personalInfo.address}</span>}
          {personalInfo.linkedin && <span> | LinkedIn: {personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc' }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p style={{ margin: '0', textAlign: 'justify' }}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc' }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          {experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <strong style={{ fontSize: '12pt' }}>{exp.position}</strong>
                  <span style={{ fontSize: '11pt' }}> - {exp.company}</span>
                  {exp.location && <span style={{ fontSize: '10pt', color: '#666' }}>, {exp.location}</span>}
                </div>
                <div style={{ fontSize: '10pt', color: '#666' }}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </div>
              </div>
              {exp.description && (
                <p style={{ margin: '5px 0 0 0', fontSize: '10pt' }}>{exp.description}</p>
              )}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul style={{ margin: '5px 0 0 20px', fontSize: '10pt' }}>
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx} style={{ marginBottom: '2px' }}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc' }}>
            EDUCATION
          </h2>
          {education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <strong>{edu.degree}</strong>
                  {edu.field && <span> in {edu.field}</span>}
                  <div style={{ fontSize: '10pt', color: '#666' }}>
                    {edu.institution}
                    {edu.location && <span>, {edu.location}</span>}
                  </div>
                </div>
                <div style={{ fontSize: '10pt', color: '#666' }}>
                  {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                </div>
              </div>
              {edu.gpa && (
                <div style={{ fontSize: '10pt', color: '#666' }}>GPA: {edu.gpa}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {Object.values(skills).some(skillArray => skillArray.length > 0) && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc' }}>
            SKILLS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {skills.technical.length > 0 && (
              <div>
                <strong style={{ fontSize: '10pt' }}>Technical:</strong>
                <div style={{ fontSize: '10pt' }}>{skills.technical.join(', ')}</div>
              </div>
            )}
            {skills.languages.length > 0 && (
              <div>
                <strong style={{ fontSize: '10pt' }}>Languages:</strong>
                <div style={{ fontSize: '10pt' }}>{skills.languages.join(', ')}</div>
              </div>
            )}
            {skills.soft.length > 0 && (
              <div>
                <strong style={{ fontSize: '10pt' }}>Soft Skills:</strong>
                <div style={{ fontSize: '10pt' }}>{skills.soft.join(', ')}</div>
              </div>
            )}
            {skills.tools.length > 0 && (
              <div>
                <strong style={{ fontSize: '10pt' }}>Tools:</strong>
                <div style={{ fontSize: '10pt' }}>{skills.tools.join(', ')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ccc' }}>
            PROJECTS
          </h2>
          {projects.map((project, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '12pt' }}>{project.name}</strong>
                <div style={{ fontSize: '10pt', color: '#666' }}>
                  {project.startDate} - {project.endDate}
                </div>
              </div>
              {project.description && (
                <p style={{ margin: '5px 0 0 0', fontSize: '10pt' }}>{project.description}</p>
              )}
              {project.technologies.length > 0 && (
                <div style={{ fontSize: '9pt', color: '#666', fontStyle: 'italic' }}>
                  Technologies: {project.technologies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Modern Template
export const ModernTemplate = ({ resumeData }) => {
  const { personalInfo, education, experience, skills, projects, certifications, awards } = resumeData;
  
  return (
    <div className="modern-template" style={{
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.5',
      color: '#333',
      maxWidth: '8.5in',
      minHeight: '11in',
      padding: '0.5in',
      backgroundColor: 'white',
      fontSize: '10pt'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        marginBottom: '20px',
        borderRadius: '10px'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28pt', fontWeight: '300' }}>
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <div style={{ fontSize: '11pt', opacity: '0.9' }}>
          <div>{personalInfo.email} | {personalInfo.phone}</div>
          <div>{personalInfo.address}</div>
          {personalInfo.linkedin && <div>LinkedIn: {personalInfo.linkedin}</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Left Column */}
        <div>
          {/* Summary */}
          {personalInfo.summary && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#667eea',
                borderLeft: '4px solid #667eea',
                paddingLeft: '15px'
              }}>
                Summary
              </h2>
              <p style={{ margin: '0', textAlign: 'justify', fontSize: '10pt' }}>{personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#667eea',
                borderLeft: '4px solid #667eea',
                paddingLeft: '15px'
              }}>
                Experience
              </h2>
              {experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: '20px', paddingLeft: '20px', borderLeft: '2px solid #e0e0e0' }}>
                  <div style={{ marginBottom: '5px' }}>
                    <strong style={{ fontSize: '12pt', color: '#333' }}>{exp.position}</strong>
                    <div style={{ fontSize: '11pt', color: '#667eea', fontWeight: '500' }}>{exp.company}</div>
                    <div style={{ fontSize: '9pt', color: '#888' }}>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      {exp.location && <span> | {exp.location}</span>}
                    </div>
                  </div>
                  {exp.description && (
                    <p style={{ margin: '8px 0', fontSize: '10pt', lineHeight: '1.4' }}>{exp.description}</p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul style={{ margin: '8px 0 0 15px', fontSize: '10pt' }}>
                      {exp.achievements.map((achievement, idx) => (
                        <li key={idx} style={{ marginBottom: '3px' }}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#667eea',
                borderLeft: '4px solid #667eea',
                paddingLeft: '15px'
              }}>
                Projects
              </h2>
              {projects.map((project, index) => (
                <div key={index} style={{ marginBottom: '15px', paddingLeft: '20px', borderLeft: '2px solid #e0e0e0' }}>
                  <strong style={{ fontSize: '11pt', color: '#333' }}>{project.name}</strong>
                  <div style={{ fontSize: '9pt', color: '#888', marginBottom: '5px' }}>
                    {project.startDate} - {project.endDate}
                  </div>
                  {project.description && (
                    <p style={{ margin: '5px 0', fontSize: '10pt' }}>{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <div style={{ fontSize: '9pt', color: '#667eea' }}>
                      {project.technologies.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div>
          {/* Skills */}
          {Object.values(skills).some(skillArray => skillArray.length > 0) && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '14pt',
                fontWeight: '600',
                marginBottom: '15px',
                color: '#667eea'
              }}>
                Skills
              </h2>
              {skills.technical.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '10pt', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                    Technical
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {skills.technical.map((skill, idx) => (
                      <span key={idx} style={{
                        fontSize: '9pt',
                        backgroundColor: '#f0f0f0',
                        padding: '3px 8px',
                        borderRadius: '15px',
                        color: '#555'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {skills.languages.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '10pt', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                    Languages
                  </h3>
                  <div style={{ fontSize: '10pt' }}>{skills.languages.join(', ')}</div>
                </div>
              )}

              {skills.tools.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '10pt', fontWeight: '600', marginBottom: '5px', color: '#333' }}>
                    Tools
                  </h3>
                  <div style={{ fontSize: '10pt' }}>{skills.tools.join(', ')}</div>
                </div>
              )}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '14pt',
                fontWeight: '600',
                marginBottom: '15px',
                color: '#667eea'
              }}>
                Education
              </h2>
              {education.map((edu, index) => (
                <div key={index} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '10pt', color: '#333' }}>{edu.degree}</strong>
                  {edu.field && <div style={{ fontSize: '10pt', color: '#667eea' }}>in {edu.field}</div>}
                  <div style={{ fontSize: '9pt', color: '#666', marginTop: '5px' }}>
                    {edu.institution}
                  </div>
                  <div style={{ fontSize: '9pt', color: '#888' }}>
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: '9pt', color: '#666' }}>GPA: {edu.gpa}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '14pt',
                fontWeight: '600',
                marginBottom: '15px',
                color: '#667eea'
              }}>
                Certifications
              </h2>
              {certifications.map((cert, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <strong style={{ fontSize: '10pt' }}>{cert.name}</strong>
                  <div style={{ fontSize: '9pt', color: '#666' }}>{cert.issuer}</div>
                  <div style={{ fontSize: '9pt', color: '#888' }}>{cert.issueDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Creative Template
export const CreativeTemplate = ({ resumeData }) => {
  const { personalInfo, education, experience, skills, projects, certifications, awards } = resumeData;
  
  return (
    <div className="creative-template" style={{
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
      lineHeight: '1.4',
      color: '#333',
      maxWidth: '8.5in',
      minHeight: '11in',
      padding: '0.5in',
      backgroundColor: 'white',
      fontSize: '10pt'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0' }}>
        {/* Left Sidebar */}
        <div style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '30px 20px',
          marginRight: '30px'
        }}>
          {/* Profile */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '48pt',
              fontWeight: '300'
            }}>
              {personalInfo.firstName?.[0]}{personalInfo.lastName?.[0]}
            </div>
            <h1 style={{
              margin: '0 0 5px 0',
              fontSize: '18pt',
              fontWeight: '300',
              letterSpacing: '1px'
            }}>
              {personalInfo.firstName}
            </h1>
            <h1 style={{
              margin: '0 0 10px 0',
              fontSize: '18pt',
              fontWeight: '700',
              letterSpacing: '1px'
            }}>
              {personalInfo.lastName}
            </h1>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{
              fontSize: '12pt',
              fontWeight: '600',
              marginBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '2px solid rgba(255,255,255,0.3)',
              paddingBottom: '5px'
            }}>
              Contact
            </h2>
            <div style={{ fontSize: '9pt', lineHeight: '1.6' }}>
              {personalInfo.email && <div style={{ marginBottom: '8px' }}>{personalInfo.email}</div>}
              {personalInfo.phone && <div style={{ marginBottom: '8px' }}>{personalInfo.phone}</div>}
              {personalInfo.address && <div style={{ marginBottom: '8px' }}>{personalInfo.address}</div>}
              {personalInfo.linkedin && <div style={{ marginBottom: '8px' }}>LinkedIn: {personalInfo.linkedin}</div>}
              {personalInfo.website && <div style={{ marginBottom: '8px' }}>{personalInfo.website}</div>}
            </div>
          </div>

          {/* Skills */}
          {Object.values(skills).some(skillArray => skillArray.length > 0) && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '12pt',
                fontWeight: '600',
                marginBottom: '15px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
                paddingBottom: '5px'
              }}>
                Skills
              </h2>
              
              {skills.technical.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '10pt', fontWeight: '600', marginBottom: '8px', color: '#ecf0f1' }}>
                    Technical
                  </h3>
                  {skills.technical.map((skill, idx) => (
                    <div key={idx} style={{
                      fontSize: '9pt',
                      marginBottom: '5px',
                      padding: '3px 0'
                    }}>
                      {skill}
                    </div>
                  ))}
                </div>
              )}

              {skills.languages.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '10pt', fontWeight: '600', marginBottom: '8px', color: '#ecf0f1' }}>
                    Languages
                  </h3>
                  {skills.languages.map((lang, idx) => (
                    <div key={idx} style={{ fontSize: '9pt', marginBottom: '5px' }}>{lang}</div>
                  ))}
                </div>
              )}

              {skills.tools.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '10pt', fontWeight: '600', marginBottom: '8px', color: '#ecf0f1' }}>
                    Tools
                  </h3>
                  {skills.tools.map((tool, idx) => (
                    <div key={idx} style={{ fontSize: '9pt', marginBottom: '5px' }}>{tool}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '12pt',
                fontWeight: '600',
                marginBottom: '15px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
                paddingBottom: '5px'
              }}>
                Education
              </h2>
              {education.map((edu, index) => (
                <div key={index} style={{ marginBottom: '15px', fontSize: '9pt' }}>
                  <div style={{ fontWeight: '600', marginBottom: '3px' }}>{edu.degree}</div>
                  {edu.field && <div style={{ color: '#ecf0f1', marginBottom: '3px' }}>in {edu.field}</div>}
                  <div style={{ color: '#bdc3c7', fontSize: '8pt' }}>
                    {edu.institution}
                  </div>
                  <div style={{ color: '#bdc3c7', fontSize: '8pt' }}>
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Content */}
        <div style={{ padding: '30px 20px' }}>
          {/* Summary */}
          {personalInfo.summary && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: '300',
                marginBottom: '15px',
                color: '#2c3e50',
                position: 'relative',
                paddingLeft: '20px'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '4px',
                  height: '20px',
                  backgroundColor: '#e74c3c'
                }}></span>
                Summary
              </h2>
              <p style={{ margin: '0', fontSize: '10pt', textAlign: 'justify', color: '#555' }}>
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: '300',
                marginBottom: '15px',
                color: '#2c3e50',
                position: 'relative',
                paddingLeft: '20px'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '4px',
                  height: '20px',
                  backgroundColor: '#e74c3c'
                }}></span>
                Experience
              </h2>
              {experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: '25px', position: 'relative', paddingLeft: '15px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '5px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#e74c3c'
                  }}></div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                      <strong style={{ fontSize: '12pt', color: '#2c3e50' }}>{exp.position}</strong>
                      <div style={{ fontSize: '9pt', color: '#7f8c8d' }}>
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#e74c3c', fontWeight: '500' }}>
                      {exp.company}
                      {exp.location && <span style={{ color: '#7f8c8d' }}> | {exp.location}</span>}
                    </div>
                  </div>
                  
                  {exp.description && (
                    <p style={{ margin: '8px 0', fontSize: '10pt', color: '#555', lineHeight: '1.4' }}>
                      {exp.description}
                    </p>
                  )}
                  
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul style={{ margin: '8px 0 0 15px', fontSize: '10pt', color: '#555' }}>
                      {exp.achievements.map((achievement, idx) => (
                        <li key={idx} style={{ marginBottom: '3px' }}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: '300',
                marginBottom: '15px',
                color: '#2c3e50',
                position: 'relative',
                paddingLeft: '20px'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '4px',
                  height: '20px',
                  backgroundColor: '#e74c3c'
                }}></span>
                Projects
              </h2>
              {projects.map((project, index) => (
                <div key={index} style={{ marginBottom: '20px', position: 'relative', paddingLeft: '15px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '5px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#e74c3c'
                  }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                    <strong style={{ fontSize: '11pt', color: '#2c3e50' }}>{project.name}</strong>
                    <div style={{ fontSize: '9pt', color: '#7f8c8d' }}>
                      {project.startDate} - {project.endDate}
                    </div>
                  </div>
                  
                  {project.description && (
                    <p style={{ margin: '5px 0', fontSize: '10pt', color: '#555' }}>
                      {project.description}
                    </p>
                  )}
                  
                  {project.technologies.length > 0 && (
                    <div style={{ fontSize: '9pt', color: '#e74c3c', fontStyle: 'italic' }}>
                      {project.technologies.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};