// Service-based workflow templates for automatic task generation
const SERVICE_WORKFLOWS = {
  'GMB': {
    name: 'Google My Business',
    description: 'Google My Business optimization and local SEO management',
    tasks: [
      {
        title: 'GMB Account Setup & Verification',
        description: 'Create or claim Google My Business listing, verify business ownership, and complete basic profile information',
        estimatedHours: 4,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Business Information Optimization',
        description: 'Complete and optimize business details, categories, services, and contact information',
        estimatedHours: 6,
        priority: 'High',
        dependencies: ['GMB Account Setup & Verification']
      },
      {
        title: 'Photos & Videos Upload',
        description: 'Upload high-quality business photos, logo, cover images, and video content to showcase the business',
        estimatedHours: 4,
        priority: 'Medium',
        dependencies: ['Business Information Optimization']
      },
      {
        title: 'Google Posts Strategy & Content',
        description: 'Create and schedule regular Google Posts including offers, events, updates, and news',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Photos & Videos Upload']
      },
      {
        title: 'Customer Review Management',
        description: 'Implement review generation strategy, respond to existing reviews, and set up review monitoring',
        estimatedHours: 6,
        priority: 'High',
        dependencies: ['Google Posts Strategy & Content']
      },
      {
        title: 'Q&A Section Optimization',
        description: 'Add frequently asked questions, provide detailed answers, and monitor customer inquiries',
        estimatedHours: 4,
        priority: 'Medium',
        dependencies: ['Customer Review Management']
      },
      {
        title: 'Local SEO Integration',
        description: 'Optimize for local search terms, ensure consistency with other local listings, and build local citations',
        estimatedHours: 10,
        priority: 'High',
        dependencies: ['Q&A Section Optimization']
      },
      {
        title: 'Products & Services Setup',
        description: 'Add detailed products and services information, pricing, and create service-specific content',
        estimatedHours: 6,
        priority: 'Medium',
        dependencies: ['Local SEO Integration']
      },
      {
        title: 'Messaging & Communication Setup',
        description: 'Enable and configure Google Messages, set up response templates, and implement communication protocols',
        estimatedHours: 4,
        priority: 'Medium',
        dependencies: ['Products & Services Setup']
      },
      {
        title: 'Analytics & Insights Setup',
        description: 'Configure Google My Business analytics, set up reporting, and create performance tracking dashboard',
        estimatedHours: 4,
        priority: 'Medium',
        dependencies: ['Messaging & Communication Setup']
      },
      {
        title: 'Monthly Optimization & Reporting',
        description: 'Regular profile updates, performance analysis, and monthly reporting on GMB metrics and insights',
        estimatedHours: 6,
        priority: 'Low',
        dependencies: ['Analytics & Insights Setup']
      }
    ]
  },
  'META ADS': {
    name: 'Meta Ads',
    description: 'Facebook & Instagram advertising campaigns and management',
    tasks: [
      {
        title: 'Client Onboarding & Discovery',
        description: 'Initial client meeting, business goals discovery, and account access setup',
        estimatedHours: 8,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Access Delegation & Account Setup',
        description: 'Facebook Business Manager setup, Instagram Business account linking, and pixel implementation',
        estimatedHours: 6,
        priority: 'High',
        dependencies: ['Client Onboarding & Discovery']
      },
      {
        title: 'Competitor Research & Market Analysis',
        description: 'Analyze competitor strategies, market trends, and audience insights',
        estimatedHours: 12,
        priority: 'Medium',
        dependencies: ['Access Delegation & Account Setup']
      },
      {
        title: 'Strategy Document Development',
        description: 'Create comprehensive advertising strategy document with campaign objectives and KPIs',
        estimatedHours: 10,
        priority: 'High',
        dependencies: ['Competitor Research & Market Analysis']
      },
      {
        title: 'Creative & Script Content Preparation',
        description: 'Design ad creatives, write compelling copy, and prepare campaign assets',
        estimatedHours: 16,
        priority: 'High',
        dependencies: ['Strategy Document Development']
      },
      {
        title: 'Facebook Profile Optimization (DP & Cover Update)',
        description: 'Update Facebook profile picture, cover photo, and business information',
        estimatedHours: 4,
        priority: 'Medium',
        dependencies: ['Creative & Script Content Preparation']
      },
      {
        title: 'Instagram Profile Optimization (DP & Bio Update)',
        description: 'Optimize Instagram profile, update bio, and ensure brand consistency',
        estimatedHours: 4,
        priority: 'Medium',
        dependencies: ['Creative & Script Content Preparation']
      },
      {
        title: 'Minimum 6 Organic Posts Published before Launch (FB & Insta)',
        description: 'Create and publish 6 organic posts to establish presence before paid campaigns',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Facebook Profile Optimization (DP & Cover Update)', 'Instagram Profile Optimization (DP & Bio Update)']
      },
      {
        title: 'Campaign Setup & Tracking Configuration',
        description: 'Configure Facebook Ads Manager, set up tracking pixels, and create custom audiences',
        estimatedHours: 6,
        priority: 'High',
        dependencies: ['Strategy Document Development']
      },
      {
        title: 'Campaign Launch',
        description: 'Launch initial ad campaigns with A/B testing and performance monitoring',
        estimatedHours: 4,
        priority: 'High',
        dependencies: ['Campaign Setup & Tracking Configuration']
      },
      {
        title: 'Reporting Automation Integration',
        description: 'Set up automated reporting dashboards and integrate with analytics tools',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Campaign Launch']
      },
      {
        title: 'Internal Team Call – Lead Access & Tracking Walkthrough',
        description: 'Conduct team training session and provide lead access walkthrough',
        estimatedHours: 2,
        priority: 'Low',
        dependencies: ['Reporting Automation Integration']
      },
      {
        title: 'Client Advisory: Lead Contact Within 12 Hours',
        description: 'Provide strategic consultation and answer client questions within 12 hours',
        estimatedHours: 1,
        priority: 'Medium',
        dependencies: ['Campaign Launch']
      },
      {
        title: 'Sales Advisory Document Shared (If Required)',
        description: 'Prepare and share comprehensive sales advisory documentation',
        estimatedHours: 3,
        priority: 'Low',
        dependencies: ['Client Advisory: Lead Contact Within 12 Hours']
      },
      {
        title: '3-Day Post-Launch Performance Review Call',
        description: 'Review campaign performance and provide optimization recommendations',
        estimatedHours: 2,
        priority: 'Medium',
        dependencies: ['Campaign Launch', 'Reporting Automation Integration']
      }
    ]
  },
  'GOOGLE ADS': {
    name: 'Google Ads',
    description: 'Google Ads campaign management and optimization',
    tasks: [
      {
        title: 'Account Setup & Campaign Structure',
        description: 'Set up Google Ads account, create campaign structure, and configure conversion tracking',
        estimatedHours: 6,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Keyword Research & Ad Group Creation',
        description: 'Research target keywords, create ad groups, and write compelling ad copy',
        estimatedHours: 12,
        priority: 'High',
        dependencies: ['Account Setup & Campaign Structure']
      },
      {
        title: 'Landing Page Optimization',
        description: 'Optimize landing pages for better conversion rates and quality score',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Keyword Research & Ad Group Creation']
      },
      {
        title: 'Campaign Launch & Monitoring',
        description: 'Launch search and display campaigns, set up monitoring, and optimize performance',
        estimatedHours: 4,
        priority: 'High',
        dependencies: ['Landing Page Optimization']
      },
      {
        title: 'Performance Analysis & Reporting',
        description: 'Analyze campaign performance, generate reports, and provide optimization recommendations',
        estimatedHours: 6,
        priority: 'Medium',
        dependencies: ['Campaign Launch & Monitoring']
      },
      {
        title: 'A/B Testing Implementation',
        description: 'Set up A/B tests for ad copy, landing pages, and targeting',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Performance Analysis & Reporting']
      },
      {
        title: 'Remarketing Campaign Setup',
        description: 'Create remarketing campaigns for website visitors and past customers',
        estimatedHours: 6,
        priority: 'Medium',
        dependencies: ['Performance Analysis & Reporting']
      }
    ]
  },
  'SEO': {
    name: 'SEO',
    description: 'Search engine optimization and website performance improvement',
    tasks: [
      {
        title: 'Website Audit & Analysis',
        description: 'Comprehensive website SEO audit including technical analysis, content review, and competitor analysis',
        estimatedHours: 16,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Keyword Research & Strategy',
        description: 'Research target keywords, analyze search intent, and develop SEO strategy',
        estimatedHours: 12,
        priority: 'High',
        dependencies: ['Website Audit & Analysis']
      },
      {
        title: 'On-Page SEO Implementation',
        description: 'Optimize meta tags, headings, content structure, and internal linking',
        estimatedHours: 20,
        priority: 'High',
        dependencies: ['Keyword Research & Strategy']
      },
      {
        title: 'Technical SEO Optimization',
        description: 'Improve page speed, mobile responsiveness, schema markup, and core web vitals',
        estimatedHours: 16,
        priority: 'High',
        dependencies: ['On-Page SEO Implementation']
      },
      {
        title: 'Content Strategy & Creation',
        description: 'Develop content strategy, create optimized blog posts, and implement content calendar',
        estimatedHours: 24,
        priority: 'Medium',
        dependencies: ['Keyword Research & Strategy']
      },
      {
        title: 'Local SEO & Google My Business',
        description: 'Optimize Google My Business profile, manage local citations, and implement local SEO strategies',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Content Strategy & Creation']
      },
      {
        title: 'Link Building & Outreach',
        description: 'Develop backlink strategy, conduct outreach campaigns, and build authority',
        estimatedHours: 20,
        priority: 'Medium',
        dependencies: ['Content Strategy & Creation']
      },
      {
        title: 'Analytics Setup & Monitoring',
        description: 'Set up Google Analytics, Search Console, and create monthly reporting dashboard',
        estimatedHours: 6,
        priority: 'Medium',
        dependencies: ['Local SEO & Google My Business']
      },
      {
        title: 'Monthly Reporting & Analysis',
        description: 'Generate comprehensive SEO reports, analyze performance metrics, and provide recommendations',
        estimatedHours: 4,
        priority: 'Medium',
        dependencies: ['Analytics Setup & Monitoring']
      }
    ]
  },
  'AMAZON ADS': {
    name: 'Amazon Ads',
    description: 'Amazon advertising campaign management and product promotion',
    tasks: [
      {
        title: 'Product Research & Selection',
        description: 'Research profitable products, analyze competition, and select products for advertising',
        estimatedHours: 12,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Campaign Setup & Structure',
        description: 'Set up Amazon Advertising campaigns, create ad groups, and configure targeting',
        estimatedHours: 8,
        priority: 'High',
        dependencies: ['Product Research & Selection']
      },
      {
        title: 'Product Listing Optimization',
        description: 'Optimize product titles, descriptions, images, and backend keywords',
        estimatedHours: 16,
        priority: 'High',
        dependencies: ['Campaign Setup & Structure']
      },
      {
        title: 'A+ Content Creation',
        description: 'Create A+ content including enhanced images, videos, and detailed descriptions',
        estimatedHours: 20,
        priority: 'Medium',
        dependencies: ['Product Listing Optimization']
      },
      {
        title: 'Campaign Launch & Management',
        description: 'Launch campaigns, monitor performance, and optimize for better ROI',
        estimatedHours: 6,
        priority: 'High',
        dependencies: ['Product Listing Optimization']
      },
      {
        title: 'Keyword & Bid Management',
        description: 'Research keywords, manage bids, and optimize campaign performance',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Campaign Launch & Management']
      },
      {
        title: 'Analytics & Reporting Setup',
        description: 'Set up Amazon advertising analytics, create performance reports, and implement tracking',
        estimatedHours: 4,
        priority: 'Medium',
        dependencies: ['Campaign Launch & Management']
      }
    ]
  },
  'AMAZON SEO': {
    name: 'Amazon SEO',
    description: 'Amazon marketplace optimization and product ranking improvement',
    tasks: [
      {
        title: 'Product Keyword Research',
        description: 'Research high-traffic keywords, analyze search volume, and identify ranking opportunities',
        estimatedHours: 16,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Product Listing Optimization',
        description: 'Optimize product titles, bullet points, descriptions, and backend keywords',
        estimatedHours: 20,
        priority: 'High',
        dependencies: ['Product Keyword Research']
      },
      {
        title: 'A+ Content Enhancement',
        description: 'Enhance product images, videos, and A+ content for better conversion',
        estimatedHours: 12,
        priority: 'Medium',
        dependencies: ['Product Listing Optimization']
      },
      {
        title: 'Customer Review Management',
        description: 'Implement customer review strategy, manage reviews, and improve product ratings',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Product Listing Optimization']
      },
      {
        title: 'Competitor Analysis',
        description: 'Analyze competitor products, pricing strategies, and market positioning',
        estimatedHours: 10,
        priority: 'Medium',
        dependencies: ['Product Listing Optimization']
      },
      {
        title: 'Amazon Storefront Optimization',
        description: 'Optimize Amazon storefront, improve navigation, and enhance user experience',
        estimatedHours: 12,
        priority: 'Medium',
        dependencies: ['Customer Review Management']
      },
      {
        title: 'Brand Registry Management',
        description: 'Manage Amazon brand registry, protect brand assets, and ensure compliance',
        estimatedHours: 6,
        priority: 'Low',
        dependencies: ['Amazon Storefront Optimization']
      }
    ]
  },
  'LINKEDIN ADS': {
    name: 'LinkedIn Ads',
    description: 'LinkedIn advertising and professional networking campaigns',
    tasks: [
      {
        title: 'Campaign Setup & Objective Definition',
        description: 'Set up LinkedIn Campaign Manager, define campaign objectives, and configure targeting',
        estimatedHours: 6,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Audience Segmentation & Targeting',
        description: 'Define target audience segments, create custom audiences, and set up targeting parameters',
        estimatedHours: 8,
        priority: 'High',
        dependencies: ['Campaign Setup & Objective Definition']
      },
      {
        title: 'Ad Creative & Copy Development',
        description: 'Create professional ad creatives, write compelling copy, and develop messaging strategy',
        estimatedHours: 12,
        priority: 'High',
        dependencies: ['Audience Segmentation & Targeting']
      },
      {
        title: 'Campaign Launch & Monitoring',
        description: 'Launch campaigns, monitor performance, and optimize for better results',
        estimatedHours: 4,
        priority: 'High',
        dependencies: ['Ad Creative & Copy Development']
      },
      {
        title: 'Lead Generation & Nurturing',
        description: 'Set up lead generation forms, implement nurturing sequences, and track conversions',
        estimatedHours: 10,
        priority: 'Medium',
        dependencies: ['Campaign Launch & Monitoring']
      },
      {
        title: 'Analytics & Reporting Setup',
        description: 'Configure LinkedIn analytics, set up conversion tracking, and create performance reports',
        estimatedHours: 4,
        priority: 'Medium',
        dependencies: ['Campaign Launch & Monitoring']
      },
      {
        title: 'A/B Testing & Optimization',
        description: 'Implement A/B testing for ad creatives, headlines, and targeting parameters',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Analytics & Reporting Setup']
      }
    ]
  },
  'GRAPHIC DESIGN': {
    name: 'Graphic Design',
    description: 'Visual design and creative asset development',
    tasks: [
      {
        title: 'Brand Guidelines Development',
        description: 'Create comprehensive brand guidelines including logo usage, color palette, typography, and imagery',
        estimatedHours: 16,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Logo Design & Refinement',
        description: 'Design or refine company logo, create variations, and ensure scalability',
        estimatedHours: 12,
        priority: 'High',
        dependencies: ['Brand Guidelines Development']
      },
      {
        title: 'Visual Identity System',
        description: 'Develop complete visual identity system including icons, illustrations, and graphic elements',
        estimatedHours: 20,
        priority: 'High',
        dependencies: ['Logo Design & Refinement']
      },
      {
        title: 'Marketing Collateral Creation',
        description: 'Design brochures, flyers, business cards, and other marketing materials',
        estimatedHours: 16,
        priority: 'Medium',
        dependencies: ['Visual Identity System']
      },
      {
        title: 'Social Media Graphics',
        description: 'Create social media graphics, banners, and profile images',
        estimatedHours: 12,
        priority: 'Medium',
        dependencies: ['Marketing Collateral Creation']
      },
      {
        title: 'Web & UI Design',
        description: 'Design website layouts, user interfaces, and digital experiences',
        estimatedHours: 24,
        priority: 'High',
        dependencies: ['Visual Identity System']
      },
      {
        title: 'Print Design & Production',
        description: 'Design print materials, prepare production files, and coordinate with printers',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Marketing Collateral Creation']
      }
    ]
  },
  'SMM': {
    name: 'SMM',
    description: 'Social media marketing and community management',
    tasks: [
      {
        title: 'Social Media Audit & Strategy',
        description: 'Audit existing social media presence, develop content strategy, and create posting schedule',
        estimatedHours: 12,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Content Calendar Development',
        description: 'Create comprehensive content calendar with themes, posting schedule, and engagement strategy',
        estimatedHours: 8,
        priority: 'High',
        dependencies: ['Social Media Audit & Strategy']
      },
      {
        title: 'Visual Content Creation',
        description: 'Create graphics, videos, stories, and other visual content for social platforms',
        estimatedHours: 20,
        priority: 'High',
        dependencies: ['Content Calendar Development']
      },
      {
        title: 'Platform-Specific Optimization',
        description: 'Optimize profiles and content for Facebook, Instagram, LinkedIn, Twitter, and other platforms',
        estimatedHours: 16,
        priority: 'Medium',
        dependencies: ['Visual Content Creation']
      },
      {
        title: 'Community Management & Engagement',
        description: 'Manage social media communities, respond to comments, and implement engagement strategies',
        estimatedHours: 12,
        priority: 'Medium',
        dependencies: ['Platform-Specific Optimization']
      },
      {
        title: 'Influencer Partnership Management',
        description: 'Identify and manage influencer partnerships, coordinate campaigns, and track performance',
        estimatedHours: 10,
        priority: 'Medium',
        dependencies: ['Community Management & Engagement']
      },
      {
        title: 'Social Media Analytics & Reporting',
        description: 'Set up analytics tracking, create performance reports, and provide optimization recommendations',
        estimatedHours: 6,
        priority: 'Medium',
        dependencies: ['Community Management & Engagement']
      }
    ]
  },
  'WEB DEVELOPMENT': {
    name: 'Web Development',
    description: 'Website and web application development',
    tasks: [
      {
        title: 'Requirements Gathering & Analysis',
        description: 'Gather business requirements, analyze technical specifications, and create project scope',
        estimatedHours: 16,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'UI/UX Design & Prototyping',
        description: 'Create wireframes, prototypes, and user experience design for the web application',
        estimatedHours: 24,
        priority: 'High',
        dependencies: ['Requirements Gathering & Analysis']
      },
      {
        title: 'Frontend Development',
        description: 'Develop responsive frontend with modern frameworks, animations, and interactive elements',
        estimatedHours: 40,
        priority: 'High',
        dependencies: ['UI/UX Design & Prototyping']
      },
      {
        title: 'Backend Development',
        description: 'Develop robust backend API, database architecture, and server-side logic',
        estimatedHours: 32,
        priority: 'High',
        dependencies: ['Frontend Development']
      },
      {
        title: 'Database Design & Implementation',
        description: 'Design database schema, implement data models, and ensure data integrity',
        estimatedHours: 20,
        priority: 'High',
        dependencies: ['Backend Development']
      },
      {
        title: 'API Development & Integration',
        description: 'Develop RESTful APIs, integrate third-party services, and implement authentication',
        estimatedHours: 24,
        priority: 'Medium',
        dependencies: ['Backend Development']
      },
      {
        title: 'Testing & Quality Assurance',
        description: 'Conduct comprehensive testing, implement CI/CD pipeline, and ensure code quality',
        estimatedHours: 16,
        priority: 'High',
        dependencies: ['API Development & Integration']
      },
      {
        title: 'Deployment & DevOps Setup',
        description: 'Set up hosting, configure CI/CD, and implement monitoring and backup systems',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Testing & Quality Assurance']
      }
    ]
  },
  'EMAIL MARKETING': {
    name: 'Email Marketing',
    description: 'Email campaign management and automation',
    tasks: [
      {
        title: 'Email List Management & Segmentation',
        description: 'Manage email lists, segment audiences, and ensure compliance with regulations',
        estimatedHours: 8,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Template Design & Development',
        description: 'Create responsive email templates, design compelling layouts, and ensure brand consistency',
        estimatedHours: 12,
        priority: 'High',
        dependencies: ['Email List Management & Segmentation']
      },
      {
        title: 'Automation Workflow Setup',
        description: 'Configure email automation, set up drip campaigns, and implement personalization',
        estimatedHours: 10,
        priority: 'Medium',
        dependencies: ['Template Design & Development']
      },
      {
        title: 'Campaign Management & Scheduling',
        description: 'Plan and schedule email campaigns, set up A/B testing, and optimize send times',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Automation Workflow Setup']
      },
      {
        title: 'Analytics & Performance Tracking',
        description: 'Set up email analytics, track open rates, conversions, and ROI metrics',
        estimatedHours: 6,
        priority: 'Medium',
        dependencies: ['Campaign Management & Scheduling']
      },
      {
        title: 'Deliverability & Compliance',
        description: 'Ensure email deliverability, maintain sender reputation, and comply with regulations',
        estimatedHours: 4,
        priority: 'High',
        dependencies: ['Analytics & Performance Tracking']
      }
    ]
  },
  'WHATSAPP MARKETING': {
    name: 'WhatsApp Marketing',
    description: 'WhatsApp marketing and customer communication',
    tasks: [
      {
        title: 'WhatsApp Business Setup & Configuration',
        description: 'Set up WhatsApp Business account, configure business profile, and verify phone number',
        estimatedHours: 4,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Contact List Management & Segmentation',
        description: 'Manage WhatsApp contact lists, segment audiences, and ensure compliance',
        estimatedHours: 6,
        priority: 'Medium',
        dependencies: ['WhatsApp Business Setup & Configuration']
      },
      {
        title: 'Template Creation & Automation',
        description: 'Create WhatsApp message templates, set up automated responses, and implement personalization',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Contact List Management & Segmentation']
      },
      {
        title: 'Campaign Planning & Execution',
        description: 'Plan WhatsApp marketing campaigns, create engaging content, and schedule broadcasts',
        estimatedHours: 10,
        priority: 'Medium',
        dependencies: ['Template Creation & Automation']
      },
      {
        title: 'Customer Support & Engagement',
        description: 'Set up customer support via WhatsApp, implement chatbot, and track engagement',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Campaign Planning & Execution']
      },
      {
        title: 'Analytics & Performance Monitoring',
        description: 'Monitor WhatsApp campaign performance, track metrics, and optimize engagement',
        estimatedHours: 4,
        priority: 'Low',
        dependencies: ['Customer Support & Engagement']
      }
    ]
  },
  'VIDEO MARKETING': {
    name: 'Video Marketing',
    description: 'Video content creation and marketing',
    tasks: [
      {
        title: 'Video Strategy & Planning',
        description: 'Develop video content strategy, plan production schedule, and define target audience',
        estimatedHours: 12,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Script Writing & Storyboarding',
        description: 'Write compelling scripts, create storyboards, and plan video sequences',
        estimatedHours: 16,
        priority: 'High',
        dependencies: ['Video Strategy & Planning']
      },
      {
        title: 'Video Production & Filming',
        description: 'Produce high-quality videos, manage filming schedule, and coordinate production team',
        estimatedHours: 24,
        priority: 'High',
        dependencies: ['Script Writing & Storyboarding']
      },
      {
        title: 'Post-Production & Editing',
        description: 'Edit videos, add effects, create graphics, and optimize for platforms',
        estimatedHours: 20,
        priority: 'High',
        dependencies: ['Video Production & Filming']
      },
      {
        title: 'Platform Optimization & Distribution',
        description: 'Optimize videos for YouTube, Instagram, Facebook, and other platforms',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Post-Production & Editing']
      },
      {
        title: 'Analytics & Performance Tracking',
        description: 'Track video performance, analyze engagement metrics, and optimize content strategy',
        estimatedHours: 6,
        priority: 'Medium',
        dependencies: ['Platform Optimization & Distribution']
      },
      {
        title: 'Live Streaming & Webinar Setup',
        description: 'Set up live streaming equipment, plan webinars, and manage broadcast schedules',
        estimatedHours: 4,
        priority: 'Low',
        dependencies: ['Analytics & Performance Tracking']
      }
    ]
  },
  'PERSONAL BRANDING': {
    name: 'Personal Branding',
    description: 'Personal brand development and online presence management',
    tasks: [
      {
        title: 'Brand Strategy & Positioning',
        description: 'Define personal brand identity, target audience, and competitive positioning',
        estimatedHours: 12,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Visual Identity Development',
        description: 'Create logo, color palette, typography, and brand guidelines',
        estimatedHours: 16,
        priority: 'High',
        dependencies: ['Brand Strategy & Positioning']
      },
      {
        title: 'Content Strategy & Creation',
        description: 'Develop content strategy, create content calendar, and produce brand-aligned content',
        estimatedHours: 20,
        priority: 'High',
        dependencies: ['Visual Identity Development']
      },
      {
        title: 'Website & Portfolio Development',
        description: 'Create personal website, develop portfolio, and showcase work',
        estimatedHours: 24,
        priority: 'High',
        dependencies: ['Content Strategy & Creation']
      },
      {
        title: 'Social Media Presence',
        description: 'Optimize social media profiles, create consistent branding, and engage audience',
        estimatedHours: 16,
        priority: 'Medium',
        dependencies: ['Website & Portfolio Development']
      },
      {
        title: 'Networking & Outreach',
        description: 'Develop networking strategy, attend industry events, and build professional relationships',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Social Media Presence']
      },
      {
        title: 'Online Reputation Management',
        description: 'Monitor online presence, manage reviews, and maintain brand consistency',
        estimatedHours: 4,
        priority: 'Low',
        dependencies: ['Networking & Outreach']
      }
    ]
  },
  'INFLUENCER OUTREACH': {
    name: 'Influencer Outreach',
    description: 'Influencer collaboration and partnership management',
    tasks: [
      {
        title: 'Influencer Research & Identification',
        description: 'Research relevant influencers, analyze audience match, and identify partnership opportunities',
        estimatedHours: 16,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Outreach Strategy & Campaign Development',
        description: 'Develop outreach strategy, create campaign briefs, and plan collaboration approach',
        estimatedHours: 12,
        priority: 'High',
        dependencies: ['Influencer Research & Identification']
      },
      {
        title: 'Partnership Negotiation & Contract Management',
        description: 'Negotiate partnership terms, manage contracts, and ensure legal compliance',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Outreach Strategy & Campaign Development']
      },
      {
        title: 'Campaign Execution & Management',
        description: 'Coordinate influencer campaigns, track performance, and manage relationships',
        estimatedHours: 20,
        priority: 'High',
        dependencies: ['Partnership Negotiation & Contract Management']
      },
      {
        title: 'Content Collaboration & Guidelines',
        description: 'Provide content guidelines, review influencer content, and ensure brand alignment',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Campaign Execution & Management']
      },
      {
        title: 'Performance Tracking & Analytics',
        description: 'Track campaign performance, measure ROI, and optimize partnership strategy',
        estimatedHours: 6,
        priority: 'Medium',
        dependencies: ['Campaign Execution & Management']
      }
    ]
  },
  'PERSONAL ASSISTANCE': {
    name: 'Personal Assistance',
    description: 'Virtual assistant and personal support services',
    tasks: [
      {
        title: 'Service Assessment & Planning',
        description: 'Assess client needs, plan assistance strategy, and define service scope',
        estimatedHours: 4,
        priority: 'High',
        dependencies: []
      },
      {
        title: 'Calendar & Schedule Management',
        description: 'Manage client calendars, schedule appointments, and coordinate meetings',
        estimatedHours: 6,
        priority: 'Medium',
        dependencies: ['Service Assessment & Planning']
      },
      {
        title: 'Communication & Correspondence',
        description: 'Handle client communications, manage correspondence, and maintain records',
        estimatedHours: 8,
        priority: 'Medium',
        dependencies: ['Calendar & Schedule Management']
      },
      {
        title: 'Research & Information Gathering',
        description: 'Conduct research, gather information, and provide comprehensive support',
        estimatedHours: 10,
        priority: 'Medium',
        dependencies: ['Communication & Correspondence']
      },
      {
        title: 'Task Execution & Follow-up',
        description: 'Execute assigned tasks, provide progress updates, and ensure completion',
        estimatedHours: 12,
        priority: 'High',
        dependencies: ['Research & Information Gathering']
      },
      {
        title: 'Documentation & Reporting',
        description: 'Document activities, create reports, and maintain client records',
        estimatedHours: 4,
        priority: 'Low',
        dependencies: ['Task Execution & Follow-up']
      }
    ]
  }
};

module.exports = SERVICE_WORKFLOWS;
