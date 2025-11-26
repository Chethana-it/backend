const Lead = require('../models/Lead');
const nodemailer = require('nodemailer');

// Generate unique Lead ID
const generateLeadId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `LEAD-${timestamp}-${random}`;
};

// Calculate lead score (0-100)
const calculateLeadScore = (data) => {
  let score = 0;
  
  const officeSize = parseInt(data.company.officeSize);
  if (officeSize > 10000) score += 30;
  else if (officeSize > 5000) score += 20;
  else if (officeSize > 2000) score += 10;
  
  const acCount = parseInt(data.company.acUnits);
  if (acCount >= 20) score += 25;
  else if (acCount >= 10) score += 20;
  else if (acCount >= 5) score += 15;
  else score += 10;
  
  const bill = parseInt(data.consumption.monthlyBill);
  if (bill >= 200000) score += 25;
  else if (bill >= 100000) score += 20;
  else if (bill >= 50000) score += 15;
  else score += 10;
  
  const email = data.contact.email.toLowerCase();
  if (!email.includes('gmail') && !email.includes('yahoo') && !email.includes('hotmail')) {
    score += 20;
  } else {
    score += 5;
  }
  
  return Math.min(score, 100);
};

// Determine lead priority
const getLeadPriority = (score) => {
  if (score >= 80) return 'HIGH';
  if (score >= 60) return 'MEDIUM';
  return 'LOW';
};

// ✅ Email Sending Function with Timeouts
const sendEmail = async (leadData) => {
  try {
    // Create email transporter with timeouts
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // ✅ Add connection timeouts
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Format numbers for display
    const formatCurrency = (num) => {
      return parseInt(num).toLocaleString('en-US');
    };

    // Email HTML template
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Energy Savings Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: white;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .savings-card {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .savings-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #d1fae5;
    }
    .savings-item:last-child {
      border-bottom: none;
    }
    .savings-label {
      font-weight: 600;
      color: #065f46;
    }
    .savings-value {
      font-size: 20px;
      font-weight: bold;
      color: #059669;
    }
    .info-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .cta-button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .features-list {
      list-style: none;
      padding: 0;
    }
    .features-list li {
      padding: 10px 0;
      padding-left: 30px;
      position: relative;
    }
    .features-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 18px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
      margin-top: 30px;
    }
    .highlight {
      background: #fef3c7;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚡ Your Energy Savings Report</h1>
  </div>
  
  <div class="content">
    <p class="greeting">Dear ${leadData.company.name} Team,</p>
    
    <p>Thank you for using our <strong>AC Energy Savings Calculator</strong>!</p>
    
    <p>Based on your current setup of <strong>${leadData.company.acUnits} AC units</strong> operating <strong>${leadData.consumption.operatingHours} hours daily</strong> in your <strong>${formatCurrency(leadData.company.officeSize)} sq ft</strong> office, here are your potential savings by switching to inverter air conditioners:</p>
    
    <div class="savings-card">
      <h2 style="margin-top: 0; color: #065f46;">💰 Your Potential Savings</h2>
      
      <div class="savings-item">
        <span class="savings-label">Monthly Savings:</span>
        <span class="savings-value">LKR ${formatCurrency(leadData.projectedSavings.monthly)}</span>
      </div>
      
      <div class="savings-item">
        <span class="savings-label">Yearly Savings:</span>
        <span class="savings-value">LKR ${formatCurrency(leadData.projectedSavings.yearly)}</span>
      </div>
      
      <div class="savings-item">
        <span class="savings-label">5-Year Savings:</span>
        <span class="savings-value">LKR ${formatCurrency(leadData.projectedSavings.fiveYear)}</span>
      </div>
      
      <div class="savings-item">
        <span class="savings-label">Energy Reduction:</span>
        <span class="savings-value">${leadData.projectedSavings.savingsPercentage}%</span>
      </div>
      
      <div class="savings-item">
        <span class="savings-label">CO₂ Reduction/Year:</span>
        <span class="savings-value">${formatCurrency(leadData.projectedSavings.co2Reduction)} kg</span>
      </div>
    </div>
    
    <div class="info-box">
      <h3 style="margin-top: 0;">📊 What This Means For Your Business</h3>
      <p>By upgrading to modern inverter AC technology, you could save approximately <span class="highlight">LKR ${formatCurrency(leadData.projectedSavings.monthly)} per month</span> on your electricity bills. That's an annual saving of <span class="highlight">LKR ${formatCurrency(leadData.projectedSavings.yearly)}</span>!</p>
      
      <p>Over 5 years, these savings amount to <strong>LKR ${formatCurrency(leadData.projectedSavings.fiveYear)}</strong>, which could significantly improve your bottom line while reducing your carbon footprint.</p>
    </div>
    
    <h3>🎁 What's Included In Your Complimentary Consultation:</h3>
    <ul class="features-list">
      <li>Detailed ROI analysis and payback period calculation</li>
      <li>Customized AC recommendations for your office layout</li>
      <li>Professional installation and maintenance cost breakdown</li>
      <li>Energy efficiency certification guidance</li>
      <li>Exclusive corporate pricing and flexible financing options</li>
      <li>Free on-site energy audit worth LKR 50,000</li>
    </ul>
    
    <center>
      <a href="#" class="cta-button">Schedule Your Free Consultation →</a>
    </center>
    
    <div class="info-box" style="margin-top: 30px;">
      <h3 style="margin-top: 0;">📞 What Happens Next?</h3>
      <p><strong>Our energy consultant will contact you within 24 hours</strong> at <strong>${leadData.contact.phone}</strong> to:</p>
      <ul>
        <li>Answer any questions about the savings projection</li>
        <li>Schedule a free on-site energy audit</li>
        <li>Provide a customized proposal with pricing</li>
        <li>Discuss financing and implementation timeline</li>
      </ul>
    </div>
    
    <p style="margin-top: 30px;">We're excited to help ${leadData.company.name} reduce energy costs and contribute to a more sustainable future!</p>
    
    <p>If you have any immediate questions, please don't hesitate to reply to this email or call us at <strong>+94 11 234 5678</strong>.</p>
    
    <p>Best regards,<br>
    <strong>The Energy Solutions Team</strong><br>
    AC Energy Solutions Pvt Ltd</p>
  </div>
  
  <div class="footer">
    <p>This email was sent to ${leadData.contact.email} because you used our Energy Savings Calculator.</p>
    <p>Your Lead Reference: <strong>${leadData.leadId}</strong></p>
    <p style="margin-top: 15px;">
      <a href="#" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> | 
      <a href="#" style="color: #6b7280; text-decoration: none;">Privacy Policy</a>
    </p>
  </div>
</body>
</html>
    `;

    // Plain text version (fallback)
    const emailText = `
Dear ${leadData.company.name} Team,

Thank you for using our AC Energy Savings Calculator!

YOUR POTENTIAL SAVINGS:
- Monthly Savings: LKR ${formatCurrency(leadData.projectedSavings.monthly)}
- Yearly Savings: LKR ${formatCurrency(leadData.projectedSavings.yearly)}
- 5-Year Savings: LKR ${formatCurrency(leadData.projectedSavings.fiveYear)}
- Energy Reduction: ${leadData.projectedSavings.savingsPercentage}%
- CO₂ Reduction: ${formatCurrency(leadData.projectedSavings.co2Reduction)} kg/year

WHAT'S NEXT?
Our energy consultant will contact you within 24 hours at ${leadData.contact.phone} to discuss your customized proposal.

Lead Reference: ${leadData.leadId}

Best regards,
The Energy Solutions Team
AC Energy Solutions Pvt Ltd
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: leadData.contact.email,
      subject: `⚡ Your Potential Savings: LKR ${formatCurrency(leadData.projectedSavings.yearly)}/year - ${leadData.company.name}`,
      text: emailText,
      html: emailHTML,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('📧 Email sent successfully!');
    console.log('   To:', leadData.contact.email);
    console.log('   Message ID:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

// ✅ Timeout wrapper for email sending
const sendEmailWithTimeout = (leadData, timeoutMs) => {
  return Promise.race([
    sendEmail(leadData),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email sending timeout')), timeoutMs)
    )
  ]);
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Public
exports.createLead = async (req, res) => {
  try {
    const leadData = req.body;

    // Generate lead ID
    const leadId = generateLeadId();

    // Calculate lead score
    const leadScore = calculateLeadScore(leadData);
    const priority = getLeadPriority(leadScore);

    // Create lead object
    const newLead = new Lead({
      leadId,
      ...leadData,
      leadScore,
      priority,
      emailSent: false, // Initially false
    });

    // Save to database
    const savedLead = await newLead.save();

    console.log('✅ Lead captured successfully:', leadId);

    // ✅ IMMEDIATE RESPONSE - Don't wait for email
    res.status(201).json({
      success: true,
      message: 'Lead captured successfully',
      data: {
        leadId: savedLead.leadId,
        leadScore: savedLead.leadScore,
        priority: savedLead.priority,
        emailSent: false, // Will be sent asynchronously
      },
    });

    // ✅ Send email AFTER response (non-blocking)
    setImmediate(async () => {
      try {
        console.log('📧 Starting email send to:', savedLead.contact.email);
        const emailSent = await sendEmailWithTimeout(savedLead, 30000); // 30 second timeout
        
        // Update database with email status
        await Lead.findOneAndUpdate(
          { leadId: savedLead.leadId },
          { emailSent: emailSent }
        );
        
        console.log('✅ Email status updated:', emailSent ? 'SUCCESS' : 'FAILED');
      } catch (error) {
        console.error('❌ Background email error:', error.message);
        // Update database to show email failed
        await Lead.findOneAndUpdate(
          { leadId: savedLead.leadId },
          { emailSent: false }
        ).catch(err => console.error('Failed to update email status:', err));
      }
    });

  } catch (error) {
    console.error('❌ Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture lead',
      error: error.message,
    });
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
exports.getAllLeads = async (req, res) => {
  try {
    const { priority, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Lead.countDocuments(query);

    res.status(200).json({
      success: true,
      data: leads,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalLeads: count,
    });
  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message,
    });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({ leadId: req.params.id });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error('❌ Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead',
      error: error.message,
    });
  }
};

// @desc    Update lead status
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const lead = await Lead.findOneAndUpdate(
      { leadId: req.params.id },
      { status, notes },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead,
    });
  } catch (error) {
    console.error('❌ Error updating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: error.message,
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ leadId: req.params.id });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting lead:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: error.message,
    });
  }
};

// @desc    Get lead statistics
// @route   GET /api/leads/stats
// @access  Private
exports.getLeadStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const highPriority = await Lead.countDocuments({ priority: 'HIGH' });
    const mediumPriority = await Lead.countDocuments({ priority: 'MEDIUM' });
    const lowPriority = await Lead.countDocuments({ priority: 'LOW' });

    const statusCounts = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const avgLeadScore = await Lead.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$leadScore' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        priorityBreakdown: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority,
        },
        statusBreakdown: statusCounts,
        averageLeadScore: avgLeadScore[0]?.avgScore?.toFixed(2) || 0,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};