class EmailService {
  static async sendEnrollmentEmail(studentData, courseData) {
    const template = this.getEnrollmentTemplate(studentData, courseData);
    return this.sendEmail(studentData.email, template.subject, template.body);
  }

  static async sendFeedbackEmail(studentData, feedbackData) {
    const template = this.getFeedbackTemplate(studentData, feedbackData);
    return this.sendEmail(studentData.email, template.subject, template.body);
  }

  static async sendCertificateEmail(studentData, certificateData) {
    const template = this.getCertificateTemplate(studentData, certificateData);
    return this.sendEmail(studentData.email, template.subject, template.body);
  }

  static getEnrollmentTemplate(studentData, courseData) {
    return {
      subject: `Welcome to ${courseData.title}!`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0;">Welcome to Your New Course!</h1>
          </div>
          
          <div style="padding: 24px;">
            <p>Dear ${studentData.name},</p>
            
            <p>We're excited to have you enrolled in ${courseData.title}! Your journey to becoming a better vocalist starts now.</p>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <h2 style="margin-top: 0;">Course Details:</h2>
              <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 8px;">📚 Course: ${courseData.title}</li>
                <li style="margin-bottom: 8px;">👨‍🏫 Instructor: ${courseData.instructorName}</li>
                <li style="margin-bottom: 8px;">📅 Start Date: ${new Date().toLocaleDateString()}</li>
              </ul>
            </div>
            
            <p>Get started by accessing your first lesson through your dashboard.</p>
            
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.REACT_APP_DASHBOARD_URL}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 24px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© 2025 VocalMaster. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  static getFeedbackTemplate(studentData, feedbackData) {
    return {
      subject: 'New Feedback Available on Your Recording',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0;">New Feedback Available</h1>
          </div>
          
          <div style="padding: 24px;">
            <p>Dear ${studentData.name},</p>
            
            <p>Your instructor has provided feedback on your recent recording in ${feedbackData.courseName}.</p>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <h2 style="margin-top: 0;">Feedback Highlights:</h2>
              <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 8px;">⭐ Overall Rating: ${feedbackData.rating}/5</li>
                <li style="margin-bottom: 8px;">📝 Key Points: ${feedbackData.keyPoints}</li>
              </ul>
            </div>
            
            <p>Log in to your dashboard to view the detailed feedback and continue your progress.</p>
            
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.REACT_APP_DASHBOARD_URL}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View Full Feedback
              </a>
            </div>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 24px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© 2025 VocalMaster. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  static getCertificateTemplate(studentData, certificateData) {
    return {
      subject: 'Congratulations on Completing Your Course!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0;">Congratulations!</h1>
          </div>
          
          <div style="padding: 24px;">
            <p>Dear ${studentData.name},</p>
            
            <p>Congratulations on completing ${certificateData.courseName}! Your dedication and hard work have paid off.</p>
            
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <h2 style="margin-top: 0;">Your Achievement:</h2>
              <p>Your certificate of completion is now available in your dashboard. You can:</p>
              <ul style="list-style-type: none; padding: 0;">
                <li style="margin-bottom: 8px;">📥 Download it as a PDF</li>
                <li style="margin-bottom: 8px;">🌐 Share it on social media</li>
                <li style="margin-bottom: 8px;">👔 Add it to your professional profiles</li>
              </ul>
            </div>
            
            <p>We hope this achievement marks another step in your musical journey.</p>
            
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.REACT_APP_DASHBOARD_URL}/certificates" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View Your Certificate
              </a>
            </div>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 24px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© 2025 VocalMaster. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }

  static async sendEmail(to, subject, body) {
    // This is where you would integrate with your email service provider
    // Example using a hypothetical email service:
    try {
      // const response = await emailProvider.send({
      //   to,
      //   subject,
      //   html: body,
      //   from: 'notifications@vocalmaster.com'
      // });
      
      console.log(`Email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
}

export default EmailService;
