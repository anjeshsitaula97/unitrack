import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const universities = [
  {
    name: "University of Melbourne",
    shortName: "UoM",
    country: "Australia",
    city: "Melbourne",
    type: "Public",
    website: "https://www.unimelb.edu.au",
    ranking: 1,
    founded: 1853,
    description:
      "A public research university located in Melbourne, Australia. Founded in 1853, it is Australia's second oldest university and one of the most prestigious in the world.",
    requirements:
      "High school diploma with strong academic record; English proficiency; standardized test scores may be required.",
    courses: [
      {
        name: "Bachelor of Computer Science",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 144,
        duration: "3 Years",
        instructor: "Dr. James Mitchell",
        description:
          "Comprehensive program covering algorithms, data structures, programming languages, and software development.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Business Administration",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 96,
        duration: "2 Years",
        instructor: "Prof. Sarah Chen",
        description:
          "World-class MBA program focusing on leadership, strategy, finance, and global business management.",
        prerequisites: "Bachelor degree, 2+ years work experience",
      },
      {
        name: "Bachelor of Commerce",
        faculty: "Business",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 144,
        duration: "3 Years",
        instructor: "Dr. Michael Torres",
        description:
          "Covers accounting, finance, economics, marketing, and management fundamentals.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Engineering (Civil)",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 96,
        duration: "2 Years",
        instructor: "Prof. David Wong",
        description:
          "Advanced study in structural engineering, geomechanics, water resources, and transport engineering.",
        prerequisites: "Bachelor in Civil Engineering",
      },
      {
        name: "Bachelor of Science (Psychology)",
        faculty: "Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 144,
        duration: "3 Years",
        instructor: "Dr. Emma Richardson",
        description:
          "Scientific study of human behavior, cognition, and mental processes with research methodology training.",
        prerequisites: "English, Biology or Mathematics",
      },
    ],
  },
  {
    name: "University of Sydney",
    shortName: "USyd",
    country: "Australia",
    city: "Sydney",
    type: "Public",
    website: "https://www.sydney.edu.au",
    ranking: 2,
    founded: 1850,
    description:
      "Australia's first university, founded in 1850. A leading global research university consistently ranked among the top universities in the world.",
    requirements:
      "Strong academic record; English proficiency (IELTS 6.5+); personal statement; references.",
    courses: [
      {
        name: "Bachelor of Engineering (Software)",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 144,
        duration: "4 Years",
        instructor: "Dr. Robert Kim",
        description:
          "Professional degree covering software design, development, testing, and project management.",
        prerequisites: "Mathematics, Physics, English",
      },
      {
        name: "Master of International Business",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 72,
        duration: "1.5 Years",
        instructor: "Prof. Lisa Nguyen",
        description:
          "Prepares students for global business leadership with cross-cultural management and international strategy.",
        prerequisites: "Bachelor degree, business background preferred",
      },
      {
        name: "Bachelor of Arts (Media and Communications)",
        faculty: "Arts",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 144,
        duration: "3 Years",
        instructor: "Dr. Alex Turner",
        description:
          "Study of media industries, digital communication, journalism, and cultural production.",
        prerequisites: "English",
      },
      {
        name: "Master of Data Science",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 96,
        duration: "2 Years",
        instructor: "Prof. Maria Garcia",
        description:
          "Advanced training in statistical modeling, machine learning, data visualization, and big data analytics.",
        prerequisites: "Bachelor in STEM field",
      },
      {
        name: "Bachelor of Laws",
        faculty: "Law",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 192,
        duration: "4 Years",
        instructor: "Prof. James Wilson",
        description:
          "Comprehensive legal education covering criminal, corporate, constitutional, and international law.",
        prerequisites: "English, high academic achievement",
      },
    ],
  },
  {
    name: "University of British Columbia",
    shortName: "UBC",
    country: "Canada",
    city: "Vancouver",
    type: "Public",
    website: "https://www.ubc.ca",
    ranking: 3,
    founded: 1908,
    description:
      "A global centre for research and teaching, consistently ranked among the top 20 public universities in the world. Located in Vancouver, Canada.",
    requirements:
      "High school diploma; English proficiency (IELTS 6.5); competitive GPA; supplemental application may be required.",
    courses: [
      {
        name: "Bachelor of Computer Science",
        faculty: "Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Mark Johnson",
        description:
          "Covers algorithms, artificial intelligence, human-computer interaction, and software engineering.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Business Analytics",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 60,
        duration: "1 Year",
        instructor: "Prof. Anna Lee",
        description:
          "Intensive program combining data analytics, machine learning, and business strategy.",
        prerequisites: "Bachelor degree, quantitative background",
      },
      {
        name: "Bachelor of Arts (Economics)",
        faculty: "Arts",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Steven Park",
        description: "Study of microeconomics, macroeconomics, econometrics, and economic policy.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Engineering",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 72,
        duration: "1.5 Years",
        instructor: "Prof. Helen Zhao",
        description:
          "Course-based master's in various engineering disciplines with focus on practical application.",
        prerequisites: "Bachelor in Engineering",
      },
      {
        name: "Bachelor of Science (Biology)",
        faculty: "Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Rachel Adams",
        description:
          "Study of molecular biology, ecology, genetics, and cellular processes with laboratory work.",
        prerequisites: "Biology, Chemistry, English",
      },
    ],
  },
  {
    name: "University of Toronto",
    shortName: "UofT",
    country: "Canada",
    city: "Toronto",
    type: "Public",
    website: "https://www.utoronto.ca",
    ranking: 4,
    founded: 1827,
    description:
      "Canada's leading university and one of the world's top research-intensive universities, known for groundbreaking research and academic excellence.",
    requirements:
      "Strong academic record; English proficiency; personal profile; extracurricular achievements.",
    courses: [
      {
        name: "Bachelor of Computer Engineering",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 144,
        duration: "4 Years",
        instructor: "Dr. Kevin Brown",
        description:
          "Integration of computer science and electrical engineering with hardware-software co-design.",
        prerequisites: "Mathematics, Physics, Chemistry, English",
      },
      {
        name: "Master of Finance",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 60,
        duration: "1 Year",
        instructor: "Prof. Richard Black",
        description:
          "Rigorous program in financial theory, quantitative methods, and investment management.",
        prerequisites: "Bachelor degree, strong quantitative skills",
      },
      {
        name: "Bachelor of Commerce",
        faculty: "Business",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Patricia White",
        description:
          "Comprehensive business education with majors in accounting, finance, marketing, and strategy.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Public Health",
        faculty: "Medicine",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 72,
        duration: "2 Years",
        instructor: "Prof. Susan Green",
        description:
          "Population health focusing on epidemiology, biostatistics, health policy, and global health.",
        prerequisites: "Bachelor degree, health-related background preferred",
      },
      {
        name: "Bachelor of Science (Computer Science)",
        faculty: "Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Thomas Gray",
        description:
          "Theoretical and practical foundations of computing, programming, and software systems.",
        prerequisites: "Mathematics, English",
      },
    ],
  },
  {
    name: "University of California, Berkeley",
    shortName: "UC Berkeley",
    country: "United States",
    city: "Berkeley, California",
    type: "Public",
    website: "https://www.berkeley.edu",
    ranking: 5,
    founded: 1868,
    description:
      "A world-renowned public research university known for its academic excellence, innovation, and social impact. Located in the San Francisco Bay Area.",
    requirements:
      "High school diploma; SAT/ACT scores; English proficiency; essays; letters of recommendation.",
    courses: [
      {
        name: "Bachelor of Science in Electrical Engineering",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. William Chen",
        description:
          "Covers circuits, signals, systems, electronics, and computer engineering fundamentals.",
        prerequisites: "Mathematics, Physics, Chemistry, English",
      },
      {
        name: "Master of Business Administration",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 72,
        duration: "2 Years",
        instructor: "Prof. Jennifer Davis",
        description:
          "Top-ranked MBA program emphasizing innovation, entrepreneurship, and evidence-based management.",
        prerequisites: "Bachelor degree, 3+ years work experience",
      },
      {
        name: "Bachelor of Arts in Economics",
        faculty: "Arts",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Michael Chang",
        description:
          "Analysis of markets, economic policy, econometrics, and behavioral economics.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Computer Science",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 48,
        duration: "1 Year",
        instructor: "Prof. David Anderson",
        description:
          "Advanced coursework in algorithms, AI, systems, databases, and machine learning.",
        prerequisites: "Bachelor in Computer Science or related",
      },
      {
        name: "Bachelor of Science in Mechanical Engineering",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Lisa Taylor",
        description:
          "Thermodynamics, fluid mechanics, solid mechanics, and robotics with hands-on design projects.",
        prerequisites: "Mathematics, Physics, Chemistry, English",
      },
    ],
  },
  {
    name: "Harvard University",
    shortName: "Harvard",
    country: "United States",
    city: "Cambridge, Massachusetts",
    type: "Private",
    website: "https://www.harvard.edu",
    ranking: 6,
    founded: 1636,
    description:
      "America's oldest institution of higher learning and one of the most prestigious universities in the world. A private Ivy League research university.",
    requirements:
      "Exceptional academic record; SAT/ACT scores; essays; extracurricular achievements; letters of recommendation; interview.",
    courses: [
      {
        name: "Bachelor of Arts in Computer Science",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 128,
        duration: "4 Years",
        instructor: "Dr. Robert Martin",
        description:
          "Foundation in computational theory, software design, data structures, and algorithms.",
        prerequisites: "Mathematics, English, strong academic record",
      },
      {
        name: "Master of Business Administration",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 96,
        duration: "2 Years",
        instructor: "Prof. Catherine Walsh",
        description:
          "Premier MBA program developing global leaders through case method and experiential learning.",
        prerequisites: "Bachelor degree, 4+ years work experience",
      },
      {
        name: "Bachelor of Arts in Economics",
        faculty: "Arts",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 128,
        duration: "4 Years",
        instructor: "Dr. John Smith",
        description:
          "Rigorous training in economic theory, quantitative methods, and applied economics.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Public Policy",
        faculty: "Public Policy",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 72,
        duration: "2 Years",
        instructor: "Prof. Elizabeth Warren",
        description:
          "Prepares leaders for public service with training in policy analysis, economics, and ethics.",
        prerequisites: "Bachelor degree, public service interest",
      },
      {
        name: "Bachelor of Arts in Psychology",
        faculty: "Arts",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 128,
        duration: "4 Years",
        instructor: "Dr. Daniel Gilbert",
        description:
          "Scientific study of mind and behavior covering cognitive, social, clinical, and developmental psychology.",
        prerequisites: "English, Biology or Mathematics",
      },
    ],
  },
  {
    name: "University of Oxford",
    shortName: "Oxford",
    country: "United Kingdom",
    city: "Oxford",
    type: "Public",
    website: "https://www.ox.ac.uk",
    ranking: 7,
    founded: 1096,
    description:
      "The oldest university in the English-speaking world, with a history spanning over 900 years. Consistently ranked among the top universities globally.",
    requirements:
      "Exceptional academic record; A-levels or equivalent; admissions test; written work; interview (highly selective).",
    courses: [
      {
        name: "Bachelor of Arts in Computer Science",
        faculty: "Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Andrew Lewis",
        description:
          "Intensive program in theoretical computer science, programming, and formal methods.",
        prerequisites: "Mathematics, strong academic record",
      },
      {
        name: "Master of Business Administration",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 72,
        duration: "1 Year",
        instructor: "Prof. Peter Thomson",
        description:
          "One-year MBA program known for entrepreneurship, social impact, and global business perspective.",
        prerequisites: "Bachelor degree, 3+ years work experience",
      },
      {
        name: "Bachelor of Arts in Economics",
        faculty: "Social Sciences",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Kate Williams",
        description:
          "Analytical study of economic theory, quantitative economics, and economic history.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Science in Data Science",
        faculty: "Science",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 96,
        duration: "1 Year",
        instructor: "Prof. Sarah James",
        description:
          "Comprehensive training in statistical learning, computational methods, and data engineering.",
        prerequisites: "Bachelor in Quantitative discipline",
      },
      {
        name: "Bachelor of Arts in Law",
        faculty: "Law",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Prof. Mark Elliott",
        description:
          "Study of legal systems, jurisprudence, constitutional law, and legal reasoning.",
        prerequisites: "English, high academic achievement",
      },
    ],
  },
  {
    name: "Imperial College London",
    shortName: "Imperial",
    country: "United Kingdom",
    city: "London",
    type: "Public",
    website: "https://www.imperial.ac.uk",
    ranking: 8,
    founded: 1907,
    description:
      "A world-class science, engineering, medicine, and business university located in the heart of London. Known for its focus on STEM fields.",
    requirements:
      "Strong STEM background; A-levels or equivalent with high grades; admissions test; interview.",
    courses: [
      {
        name: "Bachelor of Engineering in Computing",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Alan Turing",
        description:
          "Comprehensive computing degree covering software, hardware, AI, and mathematical foundations.",
        prerequisites: "Mathematics, Physics, English",
      },
      {
        name: "Master of Science in Artificial Intelligence",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 96,
        duration: "1 Year",
        instructor: "Prof. Geoffrey Hinton",
        description:
          "Advanced AI and machine learning study including deep learning, NLP, and computer vision.",
        prerequisites: "Bachelor in Computer Science or related",
      },
      {
        name: "Bachelor of Science in Mathematics",
        faculty: "Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. John Conway",
        description:
          "Pure and applied mathematics with options in statistics, finance, and computational mathematics.",
        prerequisites: "Mathematics, Further Mathematics",
      },
      {
        name: "Master of Engineering in Mechanical Engineering",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 144,
        duration: "4 Years",
        instructor: "Prof. Richard Feynman",
        description:
          "Integrated master's covering solid mechanics, thermodynamics, fluid dynamics, and materials science.",
        prerequisites: "Mathematics, Physics, English",
      },
      {
        name: "Bachelor of Medicine, Bachelor of Surgery",
        faculty: "Medicine",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 240,
        duration: "6 Years",
        instructor: "Prof. Alexander Fleming",
        description:
          "Medical degree program integrating clinical training with biomedical science research.",
        prerequisites: "Chemistry, Biology, English; UCAT exam",
      },
    ],
  },
  {
    name: "University of Tokyo",
    shortName: "Todai",
    country: "Japan",
    city: "Tokyo",
    type: "Public",
    website: "https://www.u-tokyo.ac.jp",
    ranking: 9,
    founded: 1877,
    description:
      "Japan's most prestigious university, known for its research output, academic excellence, and distinguished alumni across all fields.",
    requirements:
      "High school diploma; EJU examination; English proficiency (TOEFL/IELTS); Japanese language proficiency for some programs; interview.",
    courses: [
      {
        name: "Bachelor of Engineering in Computer Science",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 124,
        duration: "4 Years",
        instructor: "Dr. Hiroshi Yamamoto",
        description:
          "Computing fundamentals, algorithms, programming, and information systems with Japanese tech focus.",
        prerequisites: "Mathematics, Physics, English",
      },
      {
        name: "Master of Science in Physics",
        faculty: "Science",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 60,
        duration: "2 Years",
        instructor: "Prof. Takaaki Kajita",
        description:
          "Advanced theoretical and experimental physics including quantum mechanics and particle physics.",
        prerequisites: "Bachelor in Physics or related",
      },
      {
        name: "Bachelor of Arts in Economics",
        faculty: "Economics",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 124,
        duration: "4 Years",
        instructor: "Dr. Yuriko Sato",
        description:
          "Economic theory, econometrics, Japanese economy, and international economics.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Engineering in Civil Engineering",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 60,
        duration: "2 Years",
        instructor: "Prof. Kenji Watanabe",
        description:
          "Structural engineering, earthquake engineering, urban planning, and infrastructure management.",
        prerequisites: "Bachelor in Civil Engineering",
      },
      {
        name: "Bachelor of Science in Chemistry",
        faculty: "Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 124,
        duration: "4 Years",
        instructor: "Dr. Ryoji Noyori",
        description:
          "Organic, inorganic, physical, and analytical chemistry with laboratory intensive training.",
        prerequisites: "Chemistry, Mathematics, Physics, English",
      },
    ],
  },
  {
    name: "National University of Singapore",
    shortName: "NUS",
    country: "Singapore",
    city: "Singapore",
    type: "Public",
    website: "https://www.nus.edu.sg",
    ranking: 10,
    founded: 1905,
    description:
      "Singapore's flagship university and a leading global research university. Consistently ranked among the best in Asia and the world.",
    requirements:
      "High school diploma; competitive GPA; English proficiency; personal statement; co-curricular record.",
    courses: [
      {
        name: "Bachelor of Computing in Computer Science",
        faculty: "Computing",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Tan Eng Chye",
        description:
          "Comprehensive computing education covering AI, cybersecurity, networking, and software engineering.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Business Administration",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 72,
        duration: "1.5 Years",
        instructor: "Prof. Andrew Rose",
        description:
          "Asian business perspective with global exposure, entrepreneurship focus, and industry partnerships.",
        prerequisites: "Bachelor degree, 2+ years work experience",
      },
      {
        name: "Bachelor of Arts in Economics",
        faculty: "Arts",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Lim Chong Yah",
        description:
          "Economic analysis, quantitative methods, development economics, and Southeast Asian economies.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Science in Data Science",
        faculty: "Computing",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 48,
        duration: "1 Year",
        instructor: "Prof. Ooi Beng Chin",
        description:
          "Statistical modeling, machine learning, big data platforms, and data visualization.",
        prerequisites: "Bachelor in quantitative discipline",
      },
      {
        name: "Bachelor of Engineering in Mechanical Engineering",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "4 Years",
        instructor: "Dr. Ajit Singh",
        description:
          "Manufacturing, robotics, energy systems, and material science with design innovation focus.",
        prerequisites: "Mathematics, Physics, English",
      },
    ],
  },
  {
    name: "University of Auckland",
    shortName: "UoA",
    country: "New Zealand",
    city: "Auckland",
    type: "Public",
    website: "https://www.auckland.ac.nz",
    ranking: 11,
    founded: 1883,
    description:
      "New Zealand's highest-ranked university and the largest research university in the country. Known for its strong programs in business, engineering, and health sciences.",
    requirements:
      "High school qualification equivalent to NCEA Level 3; English proficiency; portfolio for some programs.",
    courses: [
      {
        name: "Bachelor of Computer Science",
        faculty: "Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Paul Smith",
        description:
          "Algorithms, data structures, programming, AI, and computer systems with practical projects.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Business Management",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 72,
        duration: "1.5 Years",
        instructor: "Prof. Susan Miller",
        description:
          "Management training covering strategy, operations, marketing, finance, and organizational behavior.",
        prerequisites: "Bachelor degree",
      },
      {
        name: "Bachelor of Commerce",
        faculty: "Business",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. James Cooper",
        description:
          "Core business disciplines with majors in accounting, finance, marketing, and international business.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Engineering",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 72,
        duration: "1.5 Years",
        instructor: "Prof. Robert Allen",
        description:
          "Advanced engineering study with research component in chemical, civil, or electrical fields.",
        prerequisites: "Bachelor in Engineering",
      },
      {
        name: "Bachelor of Science (Nursing)",
        faculty: "Health",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Margaret Clark",
        description:
          "Professional nursing education combining clinical theory with supervised hospital placements.",
        prerequisites: "Biology, Chemistry, English",
      },
    ],
  },
  {
    name: "Technical University of Munich",
    shortName: "TUM",
    country: "Germany",
    city: "Munich",
    type: "Public",
    website: "https://www.tum.de",
    ranking: 12,
    founded: 1868,
    description:
      "Germany's leading technical university and one of Europe's most prestigious engineering institutions. Known for innovation in science and technology.",
    requirements:
      "High school diploma equivalent to German Abitur; proof of German or English proficiency; entrance exam for some programs.",
    courses: [
      {
        name: "Bachelor of Science in Computer Science",
        faculty: "Computer Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Manfred Bauer",
        description:
          "Theoretical and practical computer science including algorithms, databases, and software engineering.",
        prerequisites: "Mathematics, English or German",
      },
      {
        name: "Master of Science in Automotive Engineering",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 90,
        duration: "2 Years",
        instructor: "Prof. Klaus Schmidt",
        description:
          "Vehicle technology, powertrain systems, automotive software, and sustainable mobility solutions.",
        prerequisites: "Bachelor in Mechanical or Automotive Engineering",
      },
      {
        name: "Bachelor of Science in Mechanical Engineering",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Franz Weber",
        description:
          "Fundamentals of mechanical design, production technology, fluid mechanics, and materials science.",
        prerequisites: "Mathematics, Physics, English or German",
      },
      {
        name: "Master of Science in Data Engineering",
        faculty: "Computer Science",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 90,
        duration: "2 Years",
        instructor: "Prof. Hans Fischer",
        description:
          "Large-scale data systems, distributed computing, data pipelines, and infrastructure engineering.",
        prerequisites: "Bachelor in CS or related",
      },
      {
        name: "Bachelor of Science in Electrical Engineering",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Heinrich Mueller",
        description:
          "Circuits, electronics, signal processing, power systems, and embedded systems design.",
        prerequisites: "Mathematics, Physics, English or German",
      },
    ],
  },
  {
    name: "University of Amsterdam",
    shortName: "UvA",
    country: "Netherlands",
    city: "Amsterdam",
    type: "Public",
    website: "https://www.uva.nl",
    ranking: 13,
    founded: 1632,
    description:
      "One of Europe's oldest and most respected research universities, located in the heart of Amsterdam. Known for its international orientation and strong programs across disciplines.",
    requirements:
      "High school diploma equivalent to Dutch VWO; English proficiency; motivation letter; GPA requirements vary by program.",
    courses: [
      {
        name: "Bachelor of Computer Science",
        faculty: "Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Pieter van der Meer",
        description:
          "Computational thinking, programming, AI, data science, and software systems with project-based learning.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Business Administration",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 60,
        duration: "1 Year",
        instructor: "Prof. Maria de Jong",
        description:
          "International business management with specializations in strategy, marketing, and finance.",
        prerequisites: "Bachelor degree, GMAT/GRE recommended",
      },
      {
        name: "Bachelor of Economics",
        faculty: "Economics",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Jan van Dijk",
        description:
          "Microeconomics, macroeconomics, econometrics, and economic policy in an international context.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Artificial Intelligence",
        faculty: "Science",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 90,
        duration: "1.5 Years",
        instructor: "Prof. Maarten de Rijke",
        description:
          "AI fundamentals including machine learning, deep learning, NLP, and multi-agent systems.",
        prerequisites: "Bachelor in AI, CS or related",
      },
      {
        name: "Bachelor of Psychology",
        faculty: "Social Sciences",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Anna Bakker",
        description:
          "Clinical, cognitive, social, and developmental psychology with research methodology training.",
        prerequisites: "English, Mathematics",
      },
    ],
  },
  {
    name: "Seoul National University",
    shortName: "SNU",
    country: "South Korea",
    city: "Seoul",
    type: "Public",
    website: "https://www.snu.ac.kr",
    ranking: 14,
    founded: 1946,
    description:
      "South Korea's premier university, recognized globally for its academic excellence, research output, and influential alumni.",
    requirements:
      "High school diploma; CSAT (Suneung) scores or equivalent; English proficiency; interviews for some programs.",
    courses: [
      {
        name: "Bachelor of Engineering in Computer Science",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 130,
        duration: "4 Years",
        instructor: "Dr. Kim Min-jun",
        description:
          "Software engineering, AI, cybersecurity, and computer systems with Korean tech industry exposure.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Business Administration",
        faculty: "Business",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 60,
        duration: "2 Years",
        instructor: "Prof. Park Ji-sung",
        description:
          "Korean business context with global perspectives in finance, marketing, and technology management.",
        prerequisites: "Bachelor degree, work experience preferred",
      },
      {
        name: "Bachelor of Arts in Economics",
        faculty: "Social Sciences",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 130,
        duration: "4 Years",
        instructor: "Dr. Lee Soo-young",
        description:
          "Economic theory, Korean economy, international trade, and quantitative analysis.",
        prerequisites: "Mathematics, English",
      },
      {
        name: "Master of Science in Chemical Engineering",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 60,
        duration: "2 Years",
        instructor: "Prof. Choi Hyun-woo",
        description:
          "Advanced chemical processes, materials synthesis, and semiconductor-related chemical engineering.",
        prerequisites: "Bachelor in Chemical Engineering",
      },
      {
        name: "Bachelor of Science in Biotechnology",
        faculty: "Agriculture",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 130,
        duration: "4 Years",
        instructor: "Dr. Yoon Seo-yeon",
        description:
          "Molecular biology, genetic engineering, bioprocessing, and bioinformatics applications.",
        prerequisites: "Biology, Chemistry, Mathematics, English",
      },
    ],
  },
  {
    name: "ETH Zurich",
    shortName: "ETH",
    country: "Switzerland",
    city: "Zurich",
    type: "Public",
    website: "https://www.ethz.ch",
    ranking: 15,
    founded: 1855,
    description:
      "One of the world's leading technical and scientific universities, consistently ranked among the best in Europe. Known for cutting-edge research and innovation.",
    requirements:
      "High school diploma equivalent to Swiss Matura; entrance exam for most programs; English or German proficiency.",
    courses: [
      {
        name: "Bachelor of Science in Computer Science",
        faculty: "Computer Science",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Markus Gross",
        description:
          "Theoretical foundations, programming methodology, algorithms, and system design.",
        prerequisites: "Mathematics, English or German",
      },
      {
        name: "Master of Science in Mechanical Engineering",
        faculty: "Engineering",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 90,
        duration: "2 Years",
        instructor: "Prof. Paolo Ermanni",
        description:
          "Advanced mechanics, materials, manufacturing, and product development with research focus.",
        prerequisites: "Bachelor in Mechanical Engineering",
      },
      {
        name: "Bachelor of Science in Electrical Engineering",
        faculty: "Engineering",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Luca Benini",
        description: "Circuits, signals, communications, control systems, and digital electronics.",
        prerequisites: "Mathematics, Physics, English or German",
      },
      {
        name: "Master of Science in Data Science",
        faculty: "Computer Science",
        degreeType: "Master",
        level: "Postgraduate",
        credits: 90,
        duration: "2 Years",
        instructor: "Prof. Thomas Hofmann",
        description:
          "Statistical machine learning, big data analytics, and computational statistics.",
        prerequisites: "Bachelor in quantitative discipline",
      },
      {
        name: "Bachelor of Science in Architecture",
        faculty: "Architecture",
        degreeType: "Bachelor",
        level: "Undergraduate",
        credits: 120,
        duration: "3 Years",
        instructor: "Dr. Joseph Schwartz",
        description:
          "Design studio, building technology, architectural theory, urban design, and structural systems.",
        prerequisites: "Portfolio, Mathematics, English or German",
      },
    ],
  },
];

async function main() {
  console.log("Seeding universities and courses...");

  for (const uni of universities) {
    const { courses, ...uniData } = uni;

    let university = await prisma.university.findFirst({ where: { name: uniData.name } });

    if (!university) {
      university = await prisma.university.create({
        data: {
          ...uniData,
          status: "Active",
          isFeatured: false,
          type: uniData.type || "Public",
        },
      });
      console.log(`  Created university: ${university.name}`);
    } else {
      console.log(`  Skipped (exists): ${university.name}`);
    }

    for (const course of courses) {
      const existing = await prisma.course.findFirst({
        where: { name: course.name, universityId: university.id },
      });

      if (existing) {
        console.log(`    Skipped (exists): ${course.name}`);
        continue;
      }

      const initials = course.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      const colors = [
        "#6366f1",
        "#ef4444",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
        "#f97316",
      ];

      await prisma.course.create({
        data: {
          ...course,
          universityId: university.id,
          initials,
          color: colors[Math.floor(Math.random() * colors.length)],
          status: "Active",
          isFeatured: false,
          language: "English",
          mode: "On Campus",
          enrolled: Math.floor(Math.random() * 200) + 20,
          tuitionFee: `${Math.floor(Math.random() * 40000) + 10000}`,
          currency: "USD",
          applicationFee: `${Math.floor(Math.random() * 150) + 50}`,
          applicationFeeCurrency: "USD",
          englishLanguageType: "IELTS",
          englishOverallScore: "6.5",
          intake: "Sept 2026, Jan 2027",
        },
      });

      console.log(`    Created course: ${course.name}`);
    }
  }

  console.log("Done! All universities and courses seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
