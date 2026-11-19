/**
 * Nerve - Semester 3 Engineering Syllabus & Progress Tracker
 * Full client-side application logic with:
 * - Official Semester 3 Courses (GYMAT301, PCEET302, PCEOT303, PBEOT304, GNEST305, UCHUT346, PCEOL307, PCEOL308)
 * - Working Login & Signup (Dual Instant Local & Firebase Cloud RTDB support)
 * - Gamified Level, XP, and Daily Study Streaks
 * - Prominent Exam Date Countdown & Urgency Awareness
 * - Reset to Empty Syllabus (Blank Slate) & Reload Semester 3 Syllabi
 * - Scientific Study Hacks & Motivational Tips
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'studyflow_syllabus_data_v5'; // Bumped to v5 for official Semester 3 modules
  const THEME_KEY = 'studyflow_theme';
  const LOCAL_ACCOUNTS_KEY = 'studyflow_local_accounts_v1';
  const CURRENT_USER_KEY = 'studyflow_current_user_v1';

  // Firebase Cloud credentials for Realtime Database & Multi-User Sync
  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyA5gPJSBgiwZccApATKbY2L4Zg9GDBXG54",
    authDomain: "nervestudy.firebaseapp.com",
    databaseURL: "https://nervestudy-default-rtdb.firebaseio.com",
    projectId: "nervestudy",
    storageBucket: "nervestudy.firebasestorage.app",
    messagingSenderId: "554217422796",
    appId: "1:554217422796:web:a7d230d91888c4b1bfa769",
    measurementId: "G-XTHTL2KFKK"
  };
  let firebaseDb = null;

  function sanitizeFirebaseKey(str) {
    if (!str) return 'unknown';
    return str.toLowerCase().trim().replace(/[\.\#\$\[\]\/]/g, '_');
  }

  // Study Hacks & Techniques list
  const STUDY_HACKS = [
    { title: 'Feynman Technique', text: 'Test your mastery by explaining concepts in simple terms without jargon. If you stumble, re-read that topic.' },
    { title: 'Active Recall', text: 'Close your notes and write down everything you remember about a subtopic before checking the answer.' },
    { title: 'Spaced Repetition', text: 'Review concepts after 1 day (R1), 3 days (R2), and 1 week (R3) to lock them permanently into long-term memory.' },
    { title: 'Pomodoro 25/5 Rule', text: '25 minutes of 100% uninterrupted single-tasking followed by a 5-minute break prevents mental fatigue.' },
    { title: 'Pareto 80/20 Rule', text: '80% of exam questions usually come from 20% of core topics. Prioritize High-Priority syllabus concepts first.' },
    { title: 'Interleaving Practice', text: 'Switch between two related modules or problem types in one study block instead of block-practicing just one.' },
    { title: 'Blurting Method', text: 'Quickly write down every formula and diagram from memory on a blank sheet, then highlight gaps in red.' },
    { title: 'Sleep Consolidation', text: 'Your brain replays and solidifies new syllabus memories during deep sleep. Never pull all-nighters before exams.' }
  ];

  // Levels Configuration
  const LEVEL_TIERS = [
    { level: 1, title: 'Novice Scholar', minXP: 0, maxXP: 200 },
    { level: 2, title: 'Diligent Learner', minXP: 200, maxXP: 500 },
    { level: 3, title: 'Master of Focus', minXP: 500, maxXP: 1000 },
    { level: 4, title: 'Exam Gladiator', minXP: 1000, maxXP: 2000 },
    { level: 5, title: 'Syllabus Conqueror', minXP: 2000, maxXP: 5000 }
  ];

  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  function getFutureDate(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  }

  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Helper generator for topics
  function makeTopic(id, name, desc = '', priority = 'medium', estHours = 2) {
    return {
      id,
      name,
      description: desc,
      priority,
      status: 'not-started',
      estHours,
      confidence: 0,
      revisions: { r1: false, r2: false, r3: false },
      notes: '',
      resources: '',
      timeSpentMinutes: 0
    };
  }

  // --- OFFICIAL SEMESTER 3 CURRICULUM DATA ---
  const DEFAULT_DATA = {
    activeSubjectId: 'sub_gymat301',
    gamification: {
      xp: 0,
      level: 1,
      streak: 1,
      lastStudyDate: getTodayDate()
    },
    subjects: [
      // 1. MATHEMATICS FOR ELECTRICAL SCIENCE – 3
      {
        id: 'sub_gymat301',
        code: 'GYMAT301',
        name: 'Mathematics for Electrical Science – 3',
        category: 'Mathematics',
        examDate: getFutureDate(18),
        description: 'Fourier transforms, complex functions, conformal mapping, complex integration, Laurent series, and residue integration.',
        modules: [
          {
            id: 'mod_mat_1',
            name: 'Module 1: Fourier Transforms',
            weight: '25%',
            order: 1,
            description: 'Fourier Integral representation, cosine and sine transforms, and derivative transforms',
            topics: [
              makeTopic('top_mat_1_1', 'Fourier Integral', 'Representation of non-periodic functions on real line', 'high', 2),
              makeTopic('top_mat_1_2', 'From Fourier Series to Fourier Integral', 'Derivation and limiting process as period L -> infinity', 'medium', 2),
              makeTopic('top_mat_1_3', 'Fourier Cosine and Sine Integrals', 'Even and odd function representations', 'high', 2),
              makeTopic('top_mat_1_4', 'Fourier Cosine and Sine Transform', 'Transform formulas and inverse definitions', 'high', 2.5),
              makeTopic('top_mat_1_5', 'Linearity of Transforms', 'Linearity properties and scalar multiplication', 'medium', 1.5),
              makeTopic('top_mat_1_6', 'Transforms of Derivatives', 'Transforms of first and higher order derivatives', 'high', 2.5),
              makeTopic('top_mat_1_7', 'Fourier Transform and its Inverse', 'Complex exponential form and Fourier inversion theorem', 'high', 3)
            ]
          },
          {
            id: 'mod_mat_2',
            name: 'Module 2: Complex Functions and Conformal Mapping',
            weight: '25%',
            order: 2,
            description: 'Analytic functions, Cauchy-Riemann equations, harmonic conjugates, and elementary mappings',
            topics: [
              makeTopic('top_mat_2_1', 'Complex Functions', 'Functions of complex variable w = f(z) = u(x,y) + i v(x,y)', 'medium', 1.5),
              makeTopic('top_mat_2_2', 'Limit and Continuity', 'Delta-epsilon definitions in the complex plane', 'medium', 2),
              makeTopic('top_mat_2_3', 'Derivative', 'Complex differentiability conditions and rules', 'medium', 2),
              makeTopic('top_mat_2_4', 'Analytic Functions', 'Definition, domain of analyticity, entire functions', 'high', 2),
              makeTopic('top_mat_2_5', 'Cauchy-Riemann Equations', 'Cartesian and polar form of CR equations and proofs', 'high', 3),
              makeTopic('top_mat_2_6', 'Laplace’s Equations', 'Harmonic operator and Laplacian in 2D', 'high', 2),
              makeTopic('top_mat_2_7', 'Harmonic Functions', 'Real and imaginary parts of analytic functions', 'high', 2),
              makeTopic('top_mat_2_8', 'Finding Harmonic Conjugate', 'Milne-Thomson method and integration approach', 'high', 2.5),
              makeTopic('top_mat_2_9', 'Conformal Mapping', 'Angle preserving property and scale factor |f\'(z)|', 'high', 2.5),
              makeTopic('top_mat_2_10', 'Mappings of w = z², w = e^z, w = 1/z, w = sin z', 'Geometric transformations of lines and curves', 'high', 3)
            ]
          },
          {
            id: 'mod_mat_3',
            name: 'Module 3: Complex Integration',
            weight: '25%',
            order: 3,
            description: 'Contour line integrals, Cauchy’s Integral Theorem, path independence, and Cauchy’s Integral Formula',
            topics: [
              makeTopic('top_mat_3_1', 'Line Integrals in the Complex Plane', 'Parametric path representation and definition', 'medium', 2),
              makeTopic('top_mat_3_2', 'Definition and Basic Properties', 'Linearity, path reversal, ML-inequality', 'medium', 2),
              makeTopic('top_mat_3_3', 'First Evaluation Method (Indefinite Integration)', 'Using complex antiderivatives for analytic functions', 'high', 2),
              makeTopic('top_mat_3_4', 'Second Evaluation Method (Parametric Integration)', 'Integration along piece-wise smooth paths', 'high', 2.5),
              makeTopic('top_mat_3_5', 'Cauchy’s Integral Theorem', 'Integration of analytic function around simple closed contour', 'high', 3),
              makeTopic('top_mat_3_6', 'Independence of Path', 'Simply connected domains and exact differentials', 'medium', 2),
              makeTopic('top_mat_3_7', 'Cauchy’s Integral Theorem on Multiply Connected Domain', 'Deformation of contours and cut-paths', 'high', 2.5),
              makeTopic('top_mat_3_8', 'Cauchy’s Integral Formula', 'Evaluating contour integrals and derivative formulas', 'high', 3)
            ]
          },
          {
            id: 'mod_mat_4',
            name: 'Module 4: Series and Residue Integration',
            weight: '25%',
            order: 4,
            description: 'Taylor, Maclaurin, and Laurent series, classification of singularities, residues, and real integrals',
            topics: [
              makeTopic('top_mat_4_1', 'Taylor Series', 'Expansion about z0, radius and circle of convergence', 'high', 2),
              makeTopic('top_mat_4_2', 'Maclaurin Series', 'Expansions of e^z, sin z, cos z, 1/(1-z)', 'medium', 1.5),
              makeTopic('top_mat_4_3', 'Laurent Series', 'Expansions in annular domains (positive and negative powers)', 'high', 3),
              makeTopic('top_mat_4_4', 'Singularities and Zeros', 'Definition and classification overview', 'medium', 1.5),
              makeTopic('top_mat_4_5', 'Isolated Singularity', 'Neighborhood characterization without other singular points', 'medium', 1.5),
              makeTopic('top_mat_4_6', 'Poles', 'Simple and higher order poles from principal part', 'high', 2),
              makeTopic('top_mat_4_7', 'Essential Singularities', 'Infinite negative terms in Laurent series', 'medium', 1.5),
              makeTopic('top_mat_4_8', 'Removable Singularities', 'Singularities with zero principal part', 'medium', 1.5),
              makeTopic('top_mat_4_9', 'Zeros of Analytic Functions', 'Order of zeros and relationship to poles', 'medium', 1.5),
              makeTopic('top_mat_4_10', 'Poles and Zeros Comparison', 'Behavior of f(z) and 1/f(z)', 'medium', 1.5),
              makeTopic('top_mat_4_11', 'Formulas for Residues', 'Simple pole limit formula and m-th order pole formula', 'high', 2.5),
              makeTopic('top_mat_4_12', 'Residue Theorem', 'Contour integration via 2*pi*i * sum of residues', 'high', 3),
              makeTopic('top_mat_4_13', 'Residue Integration', 'Step-by-step evaluation of closed contour integrals', 'high', 3),
              makeTopic('top_mat_4_14', 'Integral of Rational Functions of cosθ and sinθ', 'Unit circle substitution z = e^(i theta) methods', 'high', 3.5)
            ]
          }
        ]
      },

      // 2. CIRCUITS AND NETWORKS
      {
        id: 'sub_pceet302',
        code: 'PCEET302',
        name: 'Circuits and Networks',
        category: 'Electrical Engineering',
        examDate: getFutureDate(22),
        description: 'Network theorems, resonance, 3-phase unbalanced circuits, transient analysis, and two-port coupled circuits.',
        modules: [
          {
            id: 'mod_cnet_1',
            name: 'Module 1: Network Theorems',
            weight: '25%',
            order: 1,
            description: 'Mesh/Nodal review, Superposition, Thevenin, Norton, Max Power, and Reciprocity theorems',
            topics: [
              makeTopic('top_net_1_1', 'Mesh Analysis and Nodal Analysis (Review)', 'Systematic matrix formulation', 'medium', 2),
              makeTopic('top_net_1_2', 'Super Mesh and Super Node', 'Handling independent and dependent current/voltage sources', 'high', 2.5),
              makeTopic('top_net_1_3', 'Superposition Principle', 'Linear circuit response summation', 'high', 2),
              makeTopic('top_net_1_4', 'Source Transformation', 'Practical voltage and current source equivalences', 'medium', 1.5),
              makeTopic('top_net_1_5', 'Analysis with DC and AC (Sinusoidal) Excitation', 'Phasor domain network solving', 'high', 2.5),
              makeTopic('top_net_1_6', 'Thevenin’s Theorem', 'Vth and Rth/Zth derivation for independent/dependent networks', 'high', 3),
              makeTopic('top_net_1_7', 'Norton’s Theorem', 'IN and RN derivation and dual circuit relations', 'high', 2.5),
              makeTopic('top_net_1_8', 'Maximum Power Transfer Theorem', 'DC (RL = Rth) and AC (ZL = Zth*) conditions', 'high', 3),
              makeTopic('top_net_1_9', 'Analysis with Independent and Dependent Sources', 'Test voltage/current method for Rin', 'high', 3),
              makeTopic('top_net_1_10', 'Reciprocity Theorem', 'Ratio of excitation to response in reciprocal networks', 'high', 2),
              makeTopic('top_net_1_11', 'Application of Reciprocity Theorem to DC Circuits', 'Verification and circuit proofs', 'medium', 2)
            ]
          },
          {
            id: 'mod_cnet_2',
            name: 'Module 2: Resonance and Three-Phase Circuits',
            weight: '25%',
            order: 2,
            description: 'Series/Parallel resonance, Quality factor, bandwidth, complex power, unbalanced 3-phase circuits, and Millman’s theorem',
            topics: [
              makeTopic('top_net_2_1', 'Resonance Overview', 'Unity power factor condition and zero reactance', 'medium', 1.5),
              makeTopic('top_net_2_2', 'Series Resonance', 'Impedance minimum and current maximum condition', 'high', 2),
              makeTopic('top_net_2_3', 'Resonant Frequency', 'Formula derivation omega0 = 1/sqrt(LC)', 'high', 1.5),
              makeTopic('top_net_2_4', 'Variation of Impedance and Current with Frequency', 'Frequency response curves', 'medium', 2),
              makeTopic('top_net_2_5', 'Bandwidth', 'Half-power frequencies omega1 and omega2 derivation', 'high', 2),
              makeTopic('top_net_2_6', 'Quality Factor (Q)', 'Energy ratio definition and Q = omega0 L / R', 'high', 2.5),
              makeTopic('top_net_2_7', 'Parallel Resonance', 'Antiresonance impedance maximum and current minimum', 'high', 2.5),
              makeTopic('top_net_2_8', 'Parallel Resonance (Series RL in Parallel with C)', 'Practical tank circuit model', 'high', 3),
              makeTopic('top_net_2_9', 'Calculation of Resonant Frequency (Parallel)', 'Dynamic impedance derivation', 'high', 2.5),
              makeTopic('top_net_2_10', 'Power in Three-Phase Circuits', 'Line vs phase voltages and currents in Star/Delta', 'high', 2.5),
              makeTopic('top_net_2_11', 'Complex Power (S = P + jQ)', 'Apparent, real, and reactive power relations', 'high', 2),
              makeTopic('top_net_2_12', 'Active, Reactive and Apparent Power', 'Two-wattmeter method formulas', 'high', 2.5),
              makeTopic('top_net_2_13', 'Balanced Load Analysis', 'Symmetrical components and phasor diagrams', 'medium', 2),
              makeTopic('top_net_2_14', 'Three-Wire Unbalanced Delta Connected Circuit', 'Mesh method and line currents', 'high', 2.5),
              makeTopic('top_net_2_15', 'Three-Phase Four-Wire Unbalanced Star Connected Circuit', 'Neutral current calculation', 'high', 2.5),
              makeTopic('top_net_2_16', 'Three-Wire Unbalanced Star Connected Circuit', 'Floating neutral voltage determination', 'high', 3),
              makeTopic('top_net_2_17', 'Millman’s Theorem', 'Neutral voltage calculation in unbalanced star circuits', 'high', 2.5),
              makeTopic('top_net_2_18', 'Neutral Shift', 'Phasor diagram of neutral point displacement', 'high', 2)
            ]
          },
          {
            id: 'mod_cnet_3',
            name: 'Module 3: Transient Analysis',
            weight: '25%',
            order: 3,
            description: 'Laplace transforms, series/parallel RL, RC, and RLC transient response, damping conditions, and AC transients',
            topics: [
              makeTopic('top_net_3_1', 'Laplace Transforms (Review)', 's-domain operational properties for transients', 'medium', 2),
              makeTopic('top_net_3_2', 'Transient Response of Series and Parallel RL Circuits', 'Differential equation and time-domain solution', 'high', 2.5),
              makeTopic('top_net_3_3', 'Transient Response of Series and Parallel RC Circuits', 'Capacitor charging and discharging dynamics', 'high', 2.5),
              makeTopic('top_net_3_4', 'DC Excitation and Initial Conditions', 'Continuity of inductor current iL(0+) and vC(0+)', 'high', 2.5),
              makeTopic('top_net_3_5', 'Natural Response', 'Zero-input unforced circuit behavior', 'medium', 1.5),
              makeTopic('top_net_3_6', 'Forced Response', 'Steady-state particular solution', 'medium', 1.5),
              makeTopic('top_net_3_7', 'Time Constant (tau = L/R, tau = RC)', 'Physical significance in settling time', 'medium', 1.5),
              makeTopic('top_net_3_8', 'Solution Using Laplace Transforms', 'Direct algebraic solving in s-domain', 'high', 3),
              makeTopic('top_net_3_9', 'Transformed Circuits in S-Domain', 'Equivalent models with initial condition sources', 'high', 3),
              makeTopic('top_net_3_10', 'Solution Using Mesh Analysis and Nodal Analysis', 'Transformed impedance matrix solving', 'high', 2.5),
              makeTopic('top_net_3_11', 'Transient Response of Series RLC Circuit', 'Second-order differential equation formulation', 'high', 3),
              makeTopic('top_net_3_12', 'Damping Concept', 'Damping factor alpha and undamped frequency omega0', 'high', 2),
              makeTopic('top_net_3_13', 'Overdamped Response (alpha > omega0)', 'Real distinct roots and non-oscillatory decay', 'high', 2.5),
              makeTopic('top_net_3_14', 'Underdamped Response (alpha < omega0)', 'Complex conjugate roots and damped oscillation', 'high', 3),
              makeTopic('top_net_3_15', 'Critically Damped Response (alpha = omega0)', 'Fastest non-oscillatory return to equilibrium', 'high', 2),
              makeTopic('top_net_3_16', 'Undamped Response (R = 0)', 'Sustained sinusoidal oscillation', 'medium', 1.5),
              makeTopic('top_net_3_17', 'Transient Response with Sinusoidal Excitation and Zero Initial Conditions', 'Switching angle transients', 'high', 3)
            ]
          },
          {
            id: 'mod_cnet_4',
            name: 'Module 4: Two-Port Networks and Coupled Circuits',
            weight: '25%',
            order: 4,
            description: 'Z, Y, h, T parameters, reciprocity/symmetry, interconnections, dot convention, and coupled circuit analysis',
            topics: [
              makeTopic('top_net_4_1', 'Two-Port Networks Concept', 'Port variables (V1, I1, V2, I2) and sign conventions', 'medium', 1.5),
              makeTopic('top_net_4_2', 'Z Parameters (Impedance)', 'Open-circuit parameters derivation', 'high', 2.5),
              makeTopic('top_net_4_3', 'Y Parameters (Admittance)', 'Short-circuit parameters derivation', 'high', 2.5),
              makeTopic('top_net_4_4', 'h Parameters (Hybrid)', 'Transistor modeling parameter derivation', 'high', 2.5),
              makeTopic('top_net_4_5', 'T Parameters (ABCD / Transmission)', 'Cascade line parameters derivation', 'high', 2.5),
              makeTopic('top_net_4_6', 'Conditions for Symmetry and Reciprocity', 'Parametric conditions table', 'high', 2.5),
              makeTopic('top_net_4_7', 'Relationship Between Parameters', 'Inter-conversion between Z, Y, h, and ABCD', 'high', 3),
              makeTopic('top_net_4_8', 'Interconnection of Two-Port Networks', 'Validity testing and parameter addition', 'high', 2),
              makeTopic('top_net_4_9', 'Series Connection (Z addition)', 'Connection rules and matrix sum', 'medium', 2),
              makeTopic('top_net_4_10', 'Parallel Connection (Y addition)', 'Connection rules and matrix sum', 'medium', 2),
              makeTopic('top_net_4_11', 'Cascade Connection (ABCD multiplication)', 'Chain rule and transmission matrix product', 'high', 2.5),
              makeTopic('top_net_4_12', 'Coupled Circuits Concept', 'Self and mutual inductance definitions', 'high', 2),
              makeTopic('top_net_4_13', 'Dot Convention', 'Voltage polarity rule based on entering current', 'high', 2.5),
              makeTopic('top_net_4_14', 'Fixing of Dots', 'Determining dot positions from physical winding sense', 'high', 2.5),
              makeTopic('top_net_4_15', 'Coefficient of Coupling (k = M/sqrt(L1 L2))', 'Coupling factor range 0 <= k <= 1', 'medium', 1.5),
              makeTopic('top_net_4_16', 'Conductively Coupled Equivalent Circuit', 'Tee and Pi equivalent decoupling networks', 'high', 3),
              makeTopic('top_net_4_17', 'Sinusoidal Steady-State Analysis of Coupled Circuits', 'Loop equations with mutual coupling terms', 'high', 3)
            ]
          }
        ]
      },

      // 3. DATA STRUCTURES AND ALGORITHMS
      {
        id: 'sub_pceot303',
        code: 'PCEOT303',
        name: 'Data Structures and Algorithms',
        category: 'Computer Science',
        examDate: getFutureDate(26),
        description: 'Linear data structures, linked lists, trees, binary search trees, graphs, sorting algorithms, and hashing.',
        modules: [
          {
            id: 'mod_dsa_1',
            name: 'Module 1: Basic Concepts, Arrays, Stacks and Queues',
            weight: '25%',
            order: 1,
            description: 'Complexity analysis, asymptotic notations, searching, stack and queue variants, and expression evaluation',
            topics: [
              makeTopic('top_dsa_1_1', 'Basic Concepts of Data Structures', 'Primitive vs non-primitive, linear vs non-linear', 'low', 1.5),
              makeTopic('top_dsa_1_2', 'Algorithms Definition & Criteria', 'Input, output, definiteness, finiteness, correctness', 'low', 1.5),
              makeTopic('top_dsa_1_3', 'Performance Analysis', 'A priori analysis vs a posteriori measurement', 'medium', 1.5),
              makeTopic('top_dsa_1_4', 'Space Complexity', 'Fixed vs variable component, recursive auxiliary space', 'medium', 2),
              makeTopic('top_dsa_1_5', 'Time Complexity', 'Counting primitive operations and step counts', 'high', 2),
              makeTopic('top_dsa_1_6', 'Asymptotic Notations (Big-O, Omega, Theta)', 'Formal bounds, growth rates, and comparisons', 'high', 2.5),
              makeTopic('top_dsa_1_7', 'Arrays', '1D and multi-dimensional row/column major addressing', 'medium', 1.5),
              makeTopic('top_dsa_1_8', 'Linear Search', 'Sequential search algorithm and O(n) analysis', 'low', 1),
              makeTopic('top_dsa_1_9', 'Binary Search', 'Iterative and recursive binary search O(log n)', 'high', 2),
              makeTopic('top_dsa_1_10', 'Stacks (LIFO)', 'Push, pop, peek, overflow and underflow conditions', 'high', 2),
              makeTopic('top_dsa_1_11', 'Queues (FIFO)', 'Enqueue, dequeue, front, rear pointers', 'high', 2),
              makeTopic('top_dsa_1_12', 'Circular Queues', 'Overcoming false overflow using modulo arithmetic', 'high', 2.5),
              makeTopic('top_dsa_1_13', 'Priority Queues', 'Ascending/descending priority queue implementation', 'high', 2.5),
              makeTopic('top_dsa_1_14', 'Double Ended Queues (Deque)', 'Input-restricted and output-restricted deques', 'medium', 2),
              makeTopic('top_dsa_1_15', 'Evaluation of Expressions', 'Infix to postfix conversion and postfix evaluation using stack', 'high', 3)
            ]
          },
          {
            id: 'mod_dsa_2',
            name: 'Module 2: Linked Lists',
            weight: '25%',
            order: 2,
            description: 'Pointers, dynamic allocation, singly, doubly, circular linked lists, stack/queue via lists, and polynomial arithmetic',
            topics: [
              makeTopic('top_dsa_2_1', 'Self-Referential Structures', 'Structure pointers and node definition in C', 'medium', 1.5),
              makeTopic('top_dsa_2_2', 'Dynamic Memory Allocation', 'malloc(), calloc(), realloc(), free() mechanics', 'medium', 1.5),
              makeTopic('top_dsa_2_3', 'Singly Linked List', 'Node structure, head pointer, traversal', 'high', 2),
              makeTopic('top_dsa_2_4', 'Operations on Linked List', 'Insertion (front, end, middle), deletion, and search', 'high', 3),
              makeTopic('top_dsa_2_5', 'Doubly Linked List', 'Forward and backward traversal, bidirectional operations', 'high', 2.5),
              makeTopic('top_dsa_2_6', 'Circular Linked List', 'Last node pointing to first node, operations', 'medium', 2),
              makeTopic('top_dsa_2_7', 'Stacks Using Linked List', 'O(1) push and pop using head pointer without size limit', 'high', 2),
              makeTopic('top_dsa_2_8', 'Queues Using Linked List', 'Front and rear pointer dynamic queue implementation', 'high', 2),
              makeTopic('top_dsa_2_9', 'Polynomial Representation Using Linked List', 'Coefficient-exponent node addition and multiplication', 'high', 3)
            ]
          },
          {
            id: 'mod_dsa_3',
            name: 'Module 3: Trees and Graphs',
            weight: '25%',
            order: 3,
            description: 'Binary trees, traversals, BST operations, graph representations, DFS, BFS, and graph applications',
            topics: [
              makeTopic('top_dsa_3_1', 'Trees Terminology', 'Root, degree, depth, height, sibling, leaf, internal node', 'medium', 1.5),
              makeTopic('top_dsa_3_2', 'Binary Trees', 'Full, complete, degenerate, and strictly binary trees', 'high', 2),
              makeTopic('top_dsa_3_3', 'Tree Operations', 'Creation, insertion, deletion, height calculation', 'medium', 2),
              makeTopic('top_dsa_3_4', 'Binary Tree Representation', 'Sequential array-based vs linked node representation', 'medium', 2),
              makeTopic('top_dsa_3_5', 'Tree Traversals', 'Inorder, Preorder, Postorder, and Level Order traversals', 'high', 3),
              makeTopic('top_dsa_3_6', 'Binary Search Trees (BST)', 'BST ordering property: Left < Root < Right', 'high', 2.5),
              makeTopic('top_dsa_3_7', 'Binary Search Tree Operations', 'Search, insert, and deletion with 3 cases', 'high', 3),
              makeTopic('top_dsa_3_8', 'Graphs Concepts', 'Directed, undirected, weighted, cycles, paths, degrees', 'medium', 2),
              makeTopic('top_dsa_3_9', 'Representation of Graphs', 'Adjacency matrix vs Adjacency list trade-offs', 'high', 2.5),
              makeTopic('top_dsa_3_10', 'Depth First Search (DFS)', 'Stack/recursive traversal, back-edges, cycle detection', 'high', 3),
              makeTopic('top_dsa_3_11', 'Breadth First Search (BFS)', 'Queue-based level traversal and shortest path in unweighted graph', 'high', 3),
              makeTopic('top_dsa_3_12', 'Applications of Graphs', 'Topological sort, connected components, spanning trees', 'high', 2.5)
            ]
          },
          {
            id: 'mod_dsa_4',
            name: 'Module 4: Sorting and Hashing',
            weight: '25%',
            order: 4,
            description: 'Comparison-based sorting (Quick, Merge, Heap), hashing functions, collision resolution, and overflow handling',
            topics: [
              makeTopic('top_dsa_4_1', 'Sorting Techniques Overview', 'Internal vs external, stable vs in-place sorting', 'low', 1.5),
              makeTopic('top_dsa_4_2', 'Selection Sort', 'Algorithm, passes, and O(n^2) complexity', 'medium', 2),
              makeTopic('top_dsa_4_3', 'Insertion Sort', 'Card insertion analogy and adaptive O(n) best case', 'medium', 2),
              makeTopic('top_dsa_4_4', 'Quick Sort', 'Partitioning (Lomuto/Hoare), pivot selection, O(n log n)', 'high', 3),
              makeTopic('top_dsa_4_5', 'Merge Sort', 'Divide and conquer, merging two sorted arrays, stable O(n log n)', 'high', 3),
              makeTopic('top_dsa_4_6', 'Heap Sort', 'Max-heapify, build-heap, and in-place O(n log n) sorting', 'high', 3),
              makeTopic('top_dsa_4_7', 'Hashing Concept', 'Direct addressing vs hash tables and load factor lambda', 'high', 2),
              makeTopic('top_dsa_4_8', 'Hashing Techniques', 'Hash table architecture and key-to-index mapping', 'medium', 2),
              makeTopic('top_dsa_4_9', 'Collision Resolution', 'Pigeonhole principle and open vs closed addressing', 'high', 2.5),
              makeTopic('top_dsa_4_10', 'Overflow Handling', 'Separate chaining vs open addressing probe sequences', 'high', 2.5),
              makeTopic('top_dsa_4_11', 'Hashing Functions Overview', 'Uniform distribution and minimize collision criteria', 'medium', 1.5),
              makeTopic('top_dsa_4_12', 'Mid Square Method', 'Squaring key and extracting middle digits', 'medium', 1.5),
              makeTopic('top_dsa_4_13', 'Division Method', 'h(k) = k mod m with prime m selection', 'high', 2),
              makeTopic('top_dsa_4_14', 'Folding Method', 'Fold shift and fold boundary techniques', 'medium', 1.5),
              makeTopic('top_dsa_4_15', 'Digit Analysis', 'Statistical extraction of most evenly distributed positions', 'medium', 1.5)
            ]
          }
        ]
      },

      // 4. DIGITAL ELECTRONICS AND LOGIC SYSTEM DESIGN
      {
        id: 'sub_pbeot304',
        code: 'PBEOT304',
        name: 'Digital Electronics and Logic System Design',
        category: 'Electronics Engineering',
        examDate: getFutureDate(30),
        description: 'Number systems, logic families, Boolean simplification, combinational circuits, flip-flops, counters, ADC/DAC, and Verilog.',
        modules: [
          {
            id: 'mod_dig_1',
            name: 'Module 1: Number Systems, Logic Gates and Boolean Algebra',
            weight: '25%',
            order: 1,
            description: 'Conversions, codes, complements, TTL/CMOS characteristics, SOP/POS, and K-Map minimization',
            topics: [
              makeTopic('top_dig_1_1', 'Number Systems – Binary, Octal and Hexadecimal', 'Radix representations and place values', 'medium', 1.5),
              makeTopic('top_dig_1_2', 'Number System Conversions', 'Base conversions between decimal, binary, octal, hex', 'high', 2),
              makeTopic('top_dig_1_3', 'ASCII Code', '7-bit and 8-bit alphanumeric character encoding', 'low', 1),
              makeTopic('top_dig_1_4', 'Excess-3 Code', 'Self-complementing non-weighted code', 'medium', 1.5),
              makeTopic('top_dig_1_5', 'Gray Code', 'Unit distance reflected code and binary-to-gray conversion', 'high', 2),
              makeTopic('top_dig_1_6', 'BCD Code (8421)', 'Binary Coded Decimal rules and packed/unpacked forms', 'medium', 1.5),
              makeTopic('top_dig_1_7', 'Signed Numbers', 'Sign-magnitude representation and range', 'medium', 1.5),
              makeTopic('top_dig_1_8', '1\'s Complement and 2\'s Complement', 'Arithmetic complementation properties', 'high', 2),
              makeTopic('top_dig_1_9', 'Addition and Subtraction using 2\'s Complement', 'Arithmetic overflow and end-around-carry handling', 'high', 2.5),
              makeTopic('top_dig_1_10', 'Basic Logic Gates (AND, OR, NOT, XOR, XNOR)', 'Truth tables, symbols, and switching circuits', 'medium', 1.5),
              makeTopic('top_dig_1_11', 'Universal Gates (NAND, NOR)', 'Realization of all basic gates using only NAND or NOR', 'high', 2.5),
              makeTopic('top_dig_1_12', 'TTL and CMOS Families', 'Fan-in, fan-out, noise margin, propagation delay, power dissipation', 'high', 2.5),
              makeTopic('top_dig_1_13', 'Internal Diagram of TTL NAND Gate', 'Totem-pole output, multi-emitter transistor operation', 'high', 3),
              makeTopic('top_dig_1_14', 'Internal Diagram of CMOS NOR Gate', 'P-MOS pull-up network and N-MOS pull-down network', 'high', 3),
              makeTopic('top_dig_1_15', 'Comparison of CMOS and TTL Performance', 'Speed, power, noise margin, packaging density', 'high', 2),
              makeTopic('top_dig_1_16', 'Boolean Laws and Theorems', 'De Morgan’s theorems, consensus theorem, absorption law', 'high', 2.5),
              makeTopic('top_dig_1_17', 'Sum of Products (SOP)', 'Minterms, canonical and standard SOP forms', 'high', 2),
              makeTopic('top_dig_1_18', 'Product of Sums (POS)', 'Maxterms, canonical and standard POS forms', 'high', 2),
              makeTopic('top_dig_1_19', 'K-Map Representation and Simplification', '2, 3, and 4 variable Karnaugh map adjacency rules', 'high', 3),
              makeTopic('top_dig_1_20', 'Pairs, Quads and Octets', 'Grouping rules, redundant group elimination, minimal equations', 'high', 3),
              makeTopic('top_dig_1_21', 'Don\'t Care Conditions', 'Exploiting X states for maximal K-map groupings', 'high', 2.5)
            ]
          },
          {
            id: 'mod_dig_2',
            name: 'Module 2: Combinational Logic Circuits',
            weight: '25%',
            order: 2,
            description: 'Adders, subtractors, parallel binary adders, comparators, parity circuits, decoders, and multiplexers',
            topics: [
              makeTopic('top_dig_2_1', 'Half Adder', 'Logic diagram, truth table: Sum = A XOR B, Carry = A.B', 'medium', 1.5),
              makeTopic('top_dig_2_2', 'Full Adder', 'Truth table and realization using two half adders and an OR gate', 'high', 2.5),
              makeTopic('top_dig_2_3', 'Half Subtractor', 'Truth table: Difference = A XOR B, Borrow = A\'B', 'medium', 1.5),
              makeTopic('top_dig_2_4', 'Full Subtractor', 'Realization using half subtractors and logic gates', 'high', 2.5),
              makeTopic('top_dig_2_5', '4-Bit Parallel Binary Adder/Subtractor', 'IC 7483 architecture and XOR mode control for 2\'s comp', 'high', 3),
              makeTopic('top_dig_2_6', 'Comparators', '1-bit, 2-bit, and 4-bit magnitude comparator (IC 7485)', 'high', 2.5),
              makeTopic('top_dig_2_7', 'Parity Generators and Checkers', 'Even and odd parity generating circuits using XOR gates', 'medium', 2),
              makeTopic('top_dig_2_8', 'Encoders', 'Octal to binary and decimal to BCD priority encoders', 'high', 2.5),
              makeTopic('top_dig_2_9', 'Decoders', '2-to-4 and 3-to-8 line decoders with active low enables', 'high', 2.5),
              makeTopic('top_dig_2_10', 'BCD to Seven Segment Decoder', 'Driving common anode and common cathode LED displays (IC 7447)', 'high', 3),
              makeTopic('top_dig_2_11', 'Multiplexers (Data Selectors)', '2:1, 4:1, 8:1, 16:1 MUX internal gate logic', 'high', 3),
              makeTopic('top_dig_2_12', 'Implementation of Boolean Expressions Using Multiplexers', 'Multiplexer synthesis technique using n-1 select lines', 'high', 3.5),
              makeTopic('top_dig_2_13', 'Demultiplexers (Data Distributors)', '1:4 and 1:8 DEMUX and decoder relationship', 'high', 2)
            ]
          },
          {
            id: 'mod_dig_3',
            name: 'Module 3: Sequential Logic Circuits',
            weight: '25%',
            order: 3,
            description: 'Latches, flip-flops (SR, JK, D, T), master-slave, conversions, counters (asynchronous, synchronous), and shift registers',
            topics: [
              makeTopic('top_dig_3_1', 'Flip-Flops vs Latches', 'Level triggered latches vs edge triggered flip-flops', 'medium', 1.5),
              makeTopic('top_dig_3_2', 'SR Flip-Flop', 'Truth table, logic diagram, forbidden state S=1, R=1', 'high', 2),
              makeTopic('top_dig_3_3', 'JK Flip-Flop', 'Eliminating invalid state with toggle condition J=1, K=1', 'high', 2.5),
              makeTopic('top_dig_3_4', 'D Flip-Flop (Data / Delay)', 'Single input transparent latch and register element', 'medium', 1.5),
              makeTopic('top_dig_3_5', 'T Flip-Flop (Toggle)', 'Divider-by-two circuit operation', 'medium', 1.5),
              makeTopic('top_dig_3_6', 'Characteristic Tables and Equations', 'Q(next) functions for SR, JK, D, and T flip-flops', 'high', 2.5),
              makeTopic('top_dig_3_7', 'Excitation Tables', 'Determining required inputs for given Q(t) -> Q(t+1) transition', 'high', 2.5),
              makeTopic('top_dig_3_8', 'JK Master-Slave Flip-Flop', 'Solving race-around condition using clock pulse level isolation', 'high', 3),
              makeTopic('top_dig_3_9', 'Conversion of Flip-Flops', 'General methodology using excitation tables and K-maps', 'high', 3),
              makeTopic('top_dig_3_10', 'SR to JK Conversion', 'Design procedure and gate implementation', 'high', 2),
              makeTopic('top_dig_3_11', 'JK to SR Conversion', 'Design procedure and verification', 'high', 2),
              makeTopic('top_dig_3_12', 'Up/Down Counters', 'Direction control logic in binary counting', 'high', 2.5),
              makeTopic('top_dig_3_13', 'Asynchronous Counters (Ripple Counters)', 'Clock cascading and propagation delay accumulation', 'high', 3),
              makeTopic('top_dig_3_14', 'Mod-6 Counter', 'Truncated ripple counter using NAND clear feedback', 'high', 2.5),
              makeTopic('top_dig_3_15', 'Mod-10 Counter (Decade Counter)', 'BCD ripple counter sequence 0000 to 1001', 'high', 3),
              makeTopic('top_dig_3_16', 'Synchronous Counters', 'Simultaneous clocking and lookahead carry advantages', 'high', 3),
              makeTopic('top_dig_3_17', 'Design of Synchronous Counters', 'State diagram, excitation table, K-map input equations', 'high', 3.5),
              makeTopic('top_dig_3_18', 'Ring Counter', 'Circular shift counter with n-states for n-flip-flops', 'medium', 2),
              makeTopic('top_dig_3_19', 'Johnson Counter (Twisted Ring)', 'Inverted feedback counter with 2n-states for n-flip-flops', 'high', 2.5),
              makeTopic('top_dig_3_20', 'Shift Registers – SISO, SIPO, PISO and PIPO', 'Data transfer modes and timing waveforms', 'high', 3)
            ]
          },
          {
            id: 'mod_dig_4',
            name: 'Module 4: State Machines, ADC, DAC and Verilog',
            weight: '25%',
            order: 4,
            description: 'Moore and Mealy state machines, R-2R DAC, flash and SAR ADC, and HDL modeling using Verilog',
            topics: [
              makeTopic('top_dig_4_1', 'Finite State Machines (FSM)', 'State representation, inputs, outputs, next state logic', 'high', 2),
              makeTopic('top_dig_4_2', 'State Transition Diagram and State Table', 'State reduction and binary assignment', 'high', 2.5),
              makeTopic('top_dig_4_3', 'Moore Machine', 'Outputs dependent purely on present state', 'high', 2.5),
              makeTopic('top_dig_4_4', 'Mealy Machine', 'Outputs dependent on present state and present input', 'high', 2.5),
              makeTopic('top_dig_4_5', 'Digital to Analog Converter (DAC) Specifications', 'Resolution, accuracy, linearity, settling time', 'medium', 2),
              makeTopic('top_dig_4_6', 'Weighted Resistor Type DAC', 'Op-amp summing amplifier with binary weighted resistors', 'high', 2.5),
              makeTopic('top_dig_4_7', 'R-2R Ladder Type DAC', 'Using only two resistor values and Thévenin analysis', 'high', 3),
              makeTopic('top_dig_4_8', 'Analog to Digital Converter (ADC) Concepts', 'Sampling, quantisation, and encoding', 'medium', 2),
              makeTopic('top_dig_4_9', 'Flash Type ADC (Simultaneous)', 'Comparator bank architecture and fastest conversion rate', 'high', 3),
              makeTopic('top_dig_4_10', 'Successive Approximation Type ADC (SAR)', 'Binary search conversion algorithm and DAC feedback', 'high', 3),
              makeTopic('top_dig_4_11', 'Introduction to Verilog HDL', 'Lexical conventions, module, port declaration, data types', 'medium', 2),
              makeTopic('top_dig_4_12', 'Implementation of AND Gate Using Verilog', 'Dataflow and behavioral modeling syntax', 'medium', 1.5),
              makeTopic('top_dig_4_13', 'Implementation of OR Gate Using Verilog', 'Continuous assignment with assign statement', 'medium', 1.5),
              makeTopic('top_dig_4_14', 'Half Adder Using Verilog', 'Gate-level and dataflow modeling examples', 'high', 2),
              makeTopic('top_dig_4_15', 'Full Adder Using Verilog', 'Hierarchical instantiation of half adders in Verilog', 'high', 2.5)
            ]
          }
        ]
      },

      // 5. INTRODUCTION TO ARTIFICIAL INTELLIGENCE AND DATA SCIENCE
      {
        id: 'sub_gnest305',
        code: 'GNEST305',
        name: 'Introduction to AI and Data Science',
        category: 'Computer Science & AI',
        examDate: getFutureDate(34),
        description: 'Machine learning fundamentals, regression, neural networks, linear algebra foundations (SVD, PCA), probability, Bayes, and data science process.',
        modules: [
          {
            id: 'mod_ai_1',
            name: 'Module 1: Introduction to AI and Machine Learning',
            weight: '25%',
            order: 1,
            description: 'Supervised vs unsupervised learning, regression, classification, logistic regression, K-Means, Perceptron, and MLP',
            topics: [
              makeTopic('top_ai_1_1', 'Basics of Machine Learning', 'Learning from data experience E with task T and performance P', 'medium', 1.5),
              makeTopic('top_ai_1_2', 'Types of Machine Learning Systems', 'Supervised, unsupervised, semi-supervised, and reinforcement learning', 'high', 2),
              makeTopic('top_ai_1_3', 'Challenges in Machine Learning', 'Overfitting, underfitting, bad data, feature selection', 'medium', 2),
              makeTopic('top_ai_1_4', 'Supervised Learning Framework', 'Labeled training sets, features, target vectors, hypothesis testing', 'high', 2),
              makeTopic('top_ai_1_5', 'Regression Models', 'Continuous target prediction and mean squared error loss', 'high', 2),
              makeTopic('top_ai_1_6', 'Classification Models', 'Discrete label prediction, decision boundaries, accuracy/precision/recall', 'high', 2.5),
              makeTopic('top_ai_1_7', 'Logistic Regression', 'Sigmoid activation function, log-odds, binary cross-entropy loss', 'high', 3),
              makeTopic('top_ai_1_8', 'Unsupervised Learning Framework', 'Unlabeled discovery, density estimation, clustering', 'medium', 2),
              makeTopic('top_ai_1_9', 'K-Means Clustering', 'Centroid initialization, assignment step, update step, convergence', 'high', 2.5),
              makeTopic('top_ai_1_10', 'Artificial Neural Networks Overview', 'Biological neuron analogy and artificial node architecture', 'medium', 1.5),
              makeTopic('top_ai_1_11', 'Perceptron', 'Single layer linear threshold unit and learning rule', 'high', 2.5),
              makeTopic('top_ai_1_12', 'Universal Approximation Theorem (Statement Only)', 'Feedforward network representation power of continuous functions', 'medium', 1.5),
              makeTopic('top_ai_1_13', 'Multi-Layer Perceptron (MLP)', 'Hidden layers, non-linear activations (ReLU, Sigmoid), backpropagation', 'high', 3),
              makeTopic('top_ai_1_14', 'Deep Neural Networks', 'Deep feature representation, gradient descent variants', 'high', 2.5),
              makeTopic('top_ai_1_15', 'Demonstration of Regression and Classification Problems Using MLP', 'Practical case studies and performance evaluation', 'high', 3)
            ]
          },
          {
            id: 'mod_ai_2',
            name: 'Module 2: Mathematical Foundations of AI and Data Science',
            weight: '25%',
            order: 2,
            description: 'Linear algebra in AI, matrix decompositions, Singular Value Decomposition (SVD), and Principal Component Analysis (PCA)',
            topics: [
              makeTopic('top_ai_2_1', 'Role of Linear Algebra in Data Representation and Analysis', 'Feature matrices, vector spaces, dot products, projections', 'high', 2.5),
              makeTopic('top_ai_2_2', 'Matrix Decomposition', 'LU, QR, and Eigendecomposition formulations', 'high', 2.5),
              makeTopic('top_ai_2_3', 'Singular Value Decomposition (SVD)', 'A = U Sigma V^T factorization for arbitrary rectangular matrices', 'high', 3.5),
              makeTopic('top_ai_2_4', 'Spectral Decomposition', 'Orthogonal diagonalization of symmetric matrices', 'high', 2.5),
              makeTopic('top_ai_2_5', 'Dimensionality Reduction Techniques', 'Curse of dimensionality and manifold learning goals', 'medium', 2),
              makeTopic('top_ai_2_6', 'Principal Component Analysis (PCA)', 'Covariance matrix eigen-analysis and variance maximization', 'high', 3.5)
            ]
          },
          {
            id: 'mod_ai_3',
            name: 'Module 3: Applied Probability and Statistics for AI and Data Science',
            weight: '25%',
            order: 3,
            description: 'Probability rules, random variables, Bayes’ theorem, statistical estimation, MLE, and linear regression',
            topics: [
              makeTopic('top_ai_3_1', 'Basics of Probability', 'Sample space, events, axioms, conditional probability', 'medium', 1.5),
              makeTopic('top_ai_3_2', 'Random Variables', 'Discrete and continuous random variables, PMF, PDF, CDF', 'high', 2),
              makeTopic('top_ai_3_3', 'Statistical Measures', 'Mean, expectation, variance, covariance, standard deviation', 'medium', 2),
              makeTopic('top_ai_3_4', 'Rules of Probability', 'Addition theorem, multiplication theorem, law of total probability', 'high', 2),
              makeTopic('top_ai_3_5', 'Bayes\' Theorem and Its Applications', 'Prior, likelihood, marginal, and posterior probability updates', 'high', 3),
              makeTopic('top_ai_3_6', 'Statistical Estimation', 'Point estimation, unbiasedness, and consistency criteria', 'medium', 2),
              makeTopic('top_ai_3_7', 'Maximum Likelihood Estimator (MLE)', 'Likelihood function, log-likelihood, parameter optimization', 'high', 3),
              makeTopic('top_ai_3_8', 'Statistical Summaries', 'Percentiles, IQR, skewness, kurtosis, and boxplots', 'medium', 1.5),
              makeTopic('top_ai_3_9', 'Correlation Analysis', 'Pearson correlation coefficient and scatter plot interpretation', 'high', 2),
              makeTopic('top_ai_3_10', 'Linear Correlation (Direct Problems Only)', 'Calculation formulas from bivariate data sets', 'high', 2.5),
              makeTopic('top_ai_3_11', 'Regression Analysis Concepts', 'Dependent vs independent variables and residuals', 'medium', 2),
              makeTopic('top_ai_3_12', 'Linear Regression Using Least Square Method', 'Normal equations derivation and best fit line slope/intercept', 'high', 3)
            ]
          },
          {
            id: 'mod_ai_4',
            name: 'Module 4: Basics of Data Science',
            weight: '25%',
            order: 4,
            description: 'Data science workflow, machine learning applications, big data, visualization tools, and implementation',
            topics: [
              makeTopic('top_ai_4_1', 'Benefits of Data Science', 'Data-driven decision making and automation impact', 'low', 1),
              makeTopic('top_ai_4_2', 'Use of Statistics and Machine Learning in Data Science', 'Synergy between inference and predictive modeling', 'medium', 1.5),
              makeTopic('top_ai_4_3', 'Data Science Process', 'Collection, cleaning, exploration, feature engineering, validation', 'high', 2.5),
              makeTopic('top_ai_4_4', 'Applications of Machine Learning in Data Science', 'Recommender systems, NLP, anomaly detection, predictive analytics', 'high', 2),
              makeTopic('top_ai_4_5', 'Modelling Process', 'Train-test split, cross-validation, hyperparameter tuning', 'high', 2.5),
              makeTopic('top_ai_4_6', 'Demonstration of ML Applications in Data Science', 'End-to-end workflow walkthrough on standard datasets', 'high', 2.5),
              makeTopic('top_ai_4_7', 'Big Data and Data Science', 'Volume, velocity, variety, veracity, value (5 V\'s)', 'medium', 1.5),
              makeTopic('top_ai_4_8', 'Data Visualization Using Tableau, Power BI, R or Python', 'Bar, line, heatmaps, dashboards, visual storytelling', 'high', 2.5),
              makeTopic('top_ai_4_9', 'Machine Learning Implementation Using Python, MATLAB or R', 'Scikit-Learn, Pandas, NumPy pipeline demonstration', 'high', 3)
            ]
          }
        ]
      },

      // 6. ECONOMICS FOR ENGINEERS
      {
        id: 'sub_uchut346',
        code: 'UCHUT346',
        name: 'Economics for Engineers',
        category: 'Humanities & Management',
        examDate: getFutureDate(38),
        description: 'Microeconomics, production functions, market structures, macroeconomics, monetary policy, taxation, national income, and value engineering.',
        modules: [
          {
            id: 'mod_eco_1',
            name: 'Module 1: Basic Economic Concepts',
            weight: '25%',
            order: 1,
            description: 'Scarcity, PPC, utility, law of demand and supply, elasticity, and market equilibrium',
            topics: [
              makeTopic('top_eco_1_1', 'Basic Economic Problems', 'Scarcity, choice, what to produce, how, and for whom', 'medium', 1.5),
              makeTopic('top_eco_1_2', 'Production Possibility Curve (PPC)', 'Opportunity cost, efficiency, and shifts in PPC', 'high', 2),
              makeTopic('top_eco_1_3', 'Utility Concept', 'Cardinal and ordinal utility concepts', 'medium', 1.5),
              makeTopic('top_eco_1_4', 'Law of Diminishing Marginal Utility', 'Equi-marginal principle and consumer surplus', 'high', 2),
              makeTopic('top_eco_1_5', 'Law of Demand', 'Demand schedule, curve, reasons for downward slope, exceptions', 'high', 2),
              makeTopic('top_eco_1_6', 'Law of Supply', 'Supply curve and factors affecting supply', 'medium', 1.5),
              makeTopic('top_eco_1_7', 'Elasticity of Demand', 'Price, income, and cross elasticity of demand', 'high', 2.5),
              makeTopic('top_eco_1_8', 'Measurement of Elasticity and Its Applications', 'Point, arc, and total outlay methods', 'high', 2.5),
              makeTopic('top_eco_1_9', 'Market Equilibrium', 'Interaction of demand and supply, equilibrium price', 'high', 2),
              makeTopic('top_eco_1_10', 'Changes in Demand and Supply and Their Effects', 'Shifts in equilibrium price and quantity', 'high', 2)
            ]
          },
          {
            id: 'mod_eco_2',
            name: 'Module 2: Production, Cost and Market Structures',
            weight: '25%',
            order: 2,
            description: 'Production function, returns to scale, cost classifications, revenue, and competition models',
            topics: [
              makeTopic('top_eco_2_1', 'Production Function', 'Short run vs long run relationships: Q = f(L, K)', 'medium', 1.5),
              makeTopic('top_eco_2_2', 'Law of Variable Proportion', 'Increasing, diminishing, and negative returns stages', 'high', 2.5),
              makeTopic('top_eco_2_3', 'Economies of Scale', 'Cost reduction through scale expansion', 'medium', 1.5),
              makeTopic('top_eco_2_4', 'Internal and External Economies', 'Technical, managerial, commercial, financial economies', 'medium', 2),
              makeTopic('top_eco_2_5', 'Cobb-Douglas Production Function', 'Properties, constant returns to scale condition alpha+beta=1', 'high', 2.5),
              makeTopic('top_eco_2_6', 'Cost Concepts', 'Fixed cost, variable cost, total cost curves', 'high', 2),
              makeTopic('top_eco_2_7', 'Social Cost and Private Cost', 'Externalities and social impact', 'medium', 1.5),
              makeTopic('top_eco_2_8', 'Explicit and Implicit Cost', 'Accounting cost vs economic cost', 'high', 2),
              makeTopic('top_eco_2_9', 'Sunk Cost', 'Irrecoverable past expenditure and decision making', 'medium', 1.5),
              makeTopic('top_eco_2_10', 'Opportunity Cost', 'Value of next best alternative forgone', 'high', 2),
              makeTopic('top_eco_2_11', 'Short Run Cost Curves', 'AFC, AVC, ATC, and MC relationships (U-shape proofs)', 'high', 3),
              makeTopic('top_eco_2_12', 'Revenue Concepts', 'Total revenue, average revenue, marginal revenue', 'medium', 1.5),
              makeTopic('top_eco_2_13', 'Firms and Their Objectives', 'Profit maximization, revenue maximization, growth', 'medium', 1.5),
              makeTopic('top_eco_2_14', 'Types of Firms', 'Sole proprietorship, partnership, joint-stock company', 'low', 1),
              makeTopic('top_eco_2_15', 'Markets Overview', 'Classification based on number of sellers and product differentiation', 'medium', 1.5),
              makeTopic('top_eco_2_16', 'Perfect Competition', 'Characteristics, price-taker firm, short run and long run equilibrium', 'high', 2.5),
              makeTopic('top_eco_2_17', 'Monopoly', 'Single seller, barriers to entry, price discrimination', 'high', 2.5),
              makeTopic('top_eco_2_18', 'Monopolistic Competition', 'Product differentiation and selling costs', 'high', 2),
              makeTopic('top_eco_2_19', 'Oligopoly', 'Interdependence, kinked demand curve model, collusion', 'high', 2.5),
              makeTopic('top_eco_2_20', 'Features and Equilibrium of a Firm', 'MR = MC rule under different market regimes', 'high', 3)
            ]
          },
          {
            id: 'mod_eco_3',
            name: 'Module 3: Monetary System, Taxation and National Income',
            weight: '25%',
            order: 3,
            description: 'Money, central banking, inflation/deflation, fiscal/monetary policies, taxation, GST, national income, and stock market',
            topics: [
              makeTopic('top_eco_3_1', 'Monetary System', 'Barter system difficulties and evolution of money', 'low', 1),
              makeTopic('top_eco_3_2', 'Money and Its Functions', 'Medium of exchange, measure of value, store of value', 'medium', 1.5),
              makeTopic('top_eco_3_3', 'Central Banking (RBI)', 'Functions, credit control, quantitative and qualitative measures', 'high', 2.5),
              makeTopic('top_eco_3_4', 'Inflation Concept', 'Demand-pull and cost-push inflation types', 'high', 2),
              makeTopic('top_eco_3_5', 'Causes and Effects of Inflation', 'Impact on consumers, debtors, creditors, economy', 'high', 2),
              makeTopic('top_eco_3_6', 'Measures to Control Inflation', 'Monetary, fiscal, and direct price controls', 'high', 2.5),
              makeTopic('top_eco_3_7', 'Monetary Policies', 'Repo rate, reverse repo rate, CRR, SLR mechanisms', 'high', 2.5),
              makeTopic('top_eco_3_8', 'Fiscal Policies', 'Government spending, public debt, deficit financing', 'high', 2),
              makeTopic('top_eco_3_9', 'Deflation', 'Causes, effects, deflationary spiral', 'medium', 1.5),
              makeTopic('top_eco_3_10', 'Taxation Overview', 'Canons of taxation (Adam Smith)', 'medium', 1.5),
              makeTopic('top_eco_3_11', 'Direct Taxes', 'Income tax, corporate tax characteristics', 'medium', 1.5),
              makeTopic('top_eco_3_12', 'Indirect Taxes', 'Excise, customs, sales taxes', 'medium', 1.5),
              makeTopic('top_eco_3_13', 'Merits and Demerits of Taxes', 'Progressive, regressive, proportional taxation', 'medium', 1.5),
              makeTopic('top_eco_3_14', 'Goods and Services Tax (GST)', 'Destination-based tax, CGST, SGST, IGST structure', 'high', 2.5),
              makeTopic('top_eco_3_15', 'National Income Concept', 'Total value of goods and services produced in an economy', 'high', 2),
              makeTopic('top_eco_3_16', 'Concepts of National Income', 'GDP, GNP, NNP, NNP at factor cost, per capita income', 'high', 3),
              makeTopic('top_eco_3_17', 'Circular Flow of Income', 'Two-sector, three-sector, and four-sector models', 'high', 2.5),
              makeTopic('top_eco_3_18', 'Methods of Estimation and Difficulties', 'Output, income, and expenditure methods, double counting problem', 'high', 3),
              makeTopic('top_eco_3_19', 'Stock Market Concept', 'Primary market vs secondary market operations', 'medium', 1.5),
              makeTopic('top_eco_3_20', 'Functions of Stock Market', 'Capital formation, liquidity, investor protection', 'medium', 1.5),
              makeTopic('top_eco_3_21', 'Problems Faced by the Indian Stock Market', 'Volatility, insider trading, regulation (SEBI)', 'medium', 1.5),
              makeTopic('top_eco_3_22', 'Demat Account and Trading Account', 'Depository participants (NSDL, CDSL) and electronic shares', 'medium', 1.5),
              makeTopic('top_eco_3_23', 'Stock Market Indicators – SENSEX and NIFTY', 'Index calculation methods and market capitalization weights', 'high', 2)
            ]
          },
          {
            id: 'mod_eco_4',
            name: 'Module 4: Value Analysis and Value Engineering',
            weight: '25%',
            order: 4,
            description: 'Value engineering procedure, cost-benefit analysis, break-even analysis, capital budgeting, and process planning',
            topics: [
              makeTopic('top_eco_4_1', 'Value Analysis', 'Product cost reduction without sacrificing quality or utility', 'high', 2),
              makeTopic('top_eco_4_2', 'Value Engineering Definition', 'Application of value methodologies during design stage', 'high', 2),
              makeTopic('top_eco_4_3', 'Cost Value', 'Total expenditure required to produce an item', 'medium', 1.5),
              makeTopic('top_eco_4_4', 'Exchange Value', 'Price an item commands in market exchange', 'medium', 1.5),
              makeTopic('top_eco_4_5', 'Use Value', 'Functional worth of product properties', 'medium', 1.5),
              makeTopic('top_eco_4_6', 'Esteem Value', 'Aesthetic and pride-of-ownership value components', 'medium', 1.5),
              makeTopic('top_eco_4_7', 'Aims of Value Engineering', 'Simplification, standardization, substitution of materials', 'medium', 1.5),
              makeTopic('top_eco_4_8', 'Advantages of Value Engineering', 'Lower lifecycle cost and higher customer satisfaction', 'medium', 1.5),
              makeTopic('top_eco_4_9', 'Application Areas of Value Engineering', 'Manufacturing, construction, service, software', 'medium', 1.5),
              makeTopic('top_eco_4_10', 'Value Engineering Procedure (Job Plan)', 'Orientation, information, function analysis, creative, evaluation, implementation', 'high', 3),
              makeTopic('top_eco_4_11', 'Break-Even Analysis (BEP)', 'Fixed costs, variable costs, contribution margin, BEP chart and formulas', 'high', 3.5),
              makeTopic('top_eco_4_12', 'Cost-Benefit Analysis', 'Discounted cash flows, benefit-cost ratio (BCR)', 'high', 2.5),
              makeTopic('top_eco_4_13', 'Capital Budgeting Techniques', 'Payback period, Net Present Value (NPV), Internal Rate of Return (IRR)', 'high', 3.5),
              makeTopic('top_eco_4_14', 'Process Planning', 'Route sheet, machine selection, sequence optimization', 'high', 2)
            ]
          }
        ]
      },

      // 7. ANALOG AND DIGITAL ELECTRONICS LAB
      {
        id: 'sub_pceol307',
        code: 'PCEOL307',
        name: 'Analog and Digital Electronics Lab',
        category: 'Practical Lab',
        examDate: getFutureDate(42),
        description: 'Hands-on practical experiments covering RC networks, diode clippers/clampers, CE amplifiers, op-amps, 555 timers, and digital ICs.',
        modules: [
          {
            id: 'mod_lab_ade_1',
            name: 'Part A: Analog Electronics Experiments',
            weight: '50%',
            order: 1,
            description: 'Minimum 6 experiments mandatory',
            topics: [
              makeTopic('top_lab_a_1', 'Pre-Lab: Oscilloscope Measurement', 'Measurement of current, voltage, frequency and phase shift in RC network', 'high', 3),
              makeTopic('top_lab_a_2', 'Circuit Simulation & PCB Layout', 'Introduction to simulation software (SPICE, KiCad, Proteus)', 'medium', 3),
              makeTopic('top_lab_a_3', 'Clipping and Clamping Circuits', 'Biased and unbiased diode clipper and clamper waveform verification', 'high', 3),
              makeTopic('top_lab_a_4', 'Zener Diode Series Voltage Regulator', 'Design, line regulation and load regulation testing', 'high', 3),
              makeTopic('top_lab_a_5', 'RC Coupled Amplifier (BJT in CE)', 'Measurement of gain, bandwidth and frequency response plot', 'high', 3.5),
              makeTopic('top_lab_a_6', 'Op-Amp Circuits: Inverting, Non-Inverting, Adder', 'Closed loop gain verification using IC 741', 'high', 3),
              makeTopic('top_lab_a_7', 'Op-Amp Integrator and Differentiator', 'Frequency response and square-to-triangular conversion', 'high', 3),
              makeTopic('top_lab_a_8', 'Comparator and Schmitt Trigger', 'Hysteresis voltage and threshold measurement using op-amp', 'high', 3),
              makeTopic('top_lab_a_9', 'Waveform Generators', 'Square, triangular, and sawtooth signal generation using op-amps', 'high', 3),
              makeTopic('top_lab_a_10', '555 Timer Astable and Monostable Circuits', 'Pulse width and duty cycle timing calculations and observation', 'high', 3)
            ]
          },
          {
            id: 'mod_lab_ade_2',
            name: 'Part B: Digital Electronics Experiments',
            weight: '50%',
            order: 2,
            description: 'Minimum 6 experiments mandatory',
            topics: [
              makeTopic('top_lab_b_1', 'Pre-Lab: Digital IC Familiarisation', 'Gate pinouts, IC datasheets interpretation (7400, 7402, 7404, etc.)', 'medium', 2),
              makeTopic('top_lab_b_2', 'Verification of De Morgan’s Theorems', 'Hardware verification using standard logic gates', 'high', 2.5),
              makeTopic('top_lab_b_3', 'Half Adder and Full Adder Using Gates', 'Hardware circuit realization and truth table verification', 'high', 3),
              makeTopic('top_lab_b_4', '4-Bit Adder/Subtractor and BCD Adder', 'IC 7483 wiring and addition/subtraction testing', 'high', 3),
              makeTopic('top_lab_b_5', 'Multiplexer IC Realisation', 'Study of MUX IC and implementation of Boolean expressions', 'high', 3),
              makeTopic('top_lab_b_6', 'Realisation of RS, T, D and JK Flip-Flops', 'Constructing flip-flops and checking excitation states', 'high', 3),
              makeTopic('top_lab_b_7', 'Ripple Counters and Modulo-N Counter', 'Asynchronous up and down counter wiring with flip-flops', 'high', 3),
              makeTopic('top_lab_b_8', 'Design of Synchronous Counters', 'State transition counter implementation using J-K flip-flops', 'high', 3.5),
              makeTopic('top_lab_b_9', '4-Bit Serial-In Serial-Out Registers', 'Shift register operation using D or JK flip-flops', 'high', 3),
              makeTopic('top_lab_b_10', 'Shift Register IC 7495, Ring and Johnson Counters', 'Shift register IC applications and sequence observation', 'high', 3)
            ]
          }
        ]
      },

      // 8. DATA STRUCTURES LAB
      {
        id: 'sub_pceol308',
        code: 'PCEOL308',
        name: 'Data Structures Lab',
        category: 'Practical Lab',
        examDate: getFutureDate(45),
        description: 'Hands-on programming assignments implementing linear and hierarchical structures, trees, sorting, and hash tables.',
        modules: [
          {
            id: 'mod_lab_dsa_1',
            name: 'Data Structures Lab Programming Assignments',
            weight: '100%',
            order: 1,
            description: 'Comprehensive implementation in C/C++',
            topics: [
              makeTopic('top_lab_ds_1', 'Implementation of Linear Search and Binary Search', 'Iterative and recursive binary search implementations', 'high', 2.5),
              makeTopic('top_lab_ds_2', 'Stack and Linear Queue Using Arrays', 'Array-based push, pop, enqueue, dequeue with boundary checks', 'high', 2.5),
              makeTopic('top_lab_ds_3', 'Priority Queues, Deque and Circular Queues Using Arrays', 'Array implementations with circular indexing', 'high', 3),
              makeTopic('top_lab_ds_4', 'Conversion of Expression Notations', 'Infix to postfix transformation and expression evaluation using stack', 'high', 3),
              makeTopic('top_lab_ds_5', 'Various Linked List Operations', 'Insertion, deletion, traversal, search on singly linked list', 'high', 3),
              makeTopic('top_lab_ds_6', 'Stack and Queue Using Linked List', 'Dynamic memory implementation without fixed maximum limit', 'high', 2.5),
              makeTopic('top_lab_ds_7', 'Polynomial Addition Using Linked List', 'Traversing and adding terms with identical exponents', 'high', 3),
              makeTopic('top_lab_ds_8', 'Polynomial Multiplication Using Linked List', 'Two-pass term multiplication and like-term combination', 'high', 3),
              makeTopic('top_lab_ds_9', 'Implementation of Doubly Linked List Operations', 'Bidirectional pointer link maintenance during insert/delete', 'high', 3),
              makeTopic('top_lab_ds_10', 'Implementation of Circular Linked List Operations', 'Circular traversal and edge case node deletion', 'high', 2.5),
              makeTopic('top_lab_ds_11', 'Binary Search Tree (BST) Creation, Insertion, Deletion, Search', 'Pointer-based BST node management and tree search', 'high', 3.5),
              makeTopic('top_lab_ds_12', 'Implementation of Tree Traversals', 'Recursive Inorder, Preorder, and Postorder routines', 'high', 2.5),
              makeTopic('top_lab_ds_13', 'Sorting Algorithms: Bubble, Insertion, and Selection Sort', 'Comparative analysis of basic quadratic sorting techniques', 'high', 3),
              makeTopic('top_lab_ds_14', 'Implementation of Merge Sort', 'Recursive divide-and-conquer implementation with helper merge', 'high', 3),
              makeTopic('top_lab_ds_15', 'Implementation of Quick Sort', 'In-place partitioning and recursive sub-array sorting', 'high', 3),
              makeTopic('top_lab_ds_16', 'Implementation of BFS and DFS on Graph', 'Graph traversal using adjacency list, queue, and stack/recursion', 'high', 3.5),
              makeTopic('top_lab_ds_17', 'Hash Table with Custom Mapping & Collision Resolution', 'Division method hashing with linear probing and chaining', 'high', 3.5)
            ]
          }
        ]
      }
    ]
  };

  // --- STATE ---
  let appState = loadLocalState();
  let currentFilter = {
    status: 'all',
    search: ''
  };
  let collapsedModules = new Set();
  let currentActiveTab = 'syllabus';
  let currentTipIndex = 0;

  // --- STUDENT AUTHENTICATION STATE (DUAL LOCAL & FIREBASE CLOUD) ---
  let currentUser = loadCurrentUser();

  function loadCurrentUser() {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  function saveCurrentUser(user) {
    currentUser = user;
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    updateAuthUI();
    checkAuthGate();
  }

  function checkAuthGate() {
    const gate = document.getElementById('screen-auth-gate');
    const appShell = document.getElementById('mobile-app-shell');
    if (!gate || !appShell) return;

    if (currentUser) {
      gate.classList.add('hidden');
      appShell.classList.remove('hidden');
    } else {
      gate.classList.remove('hidden');
      appShell.classList.add('hidden');
    }
  }

  function getLocalAccounts() {
    try {
      const saved = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalAccounts(accounts) {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  function initFirebase() {
    try {
      if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
          firebase.initializeApp(DEFAULT_FIREBASE_CONFIG);
        }
        firebaseDb = firebase.database();
        console.log('Firebase Realtime Database initialized successfully!');
        setupFirebaseRealtimeListeners();
      }
    } catch (e) {
      console.warn('Firebase initialization error:', e);
    }
  }

  function setupFirebaseRealtimeListeners() {
    if (!firebaseDb) return;
    try {
      firebaseDb.ref('students').on('value', () => {
        const lbView = document.getElementById('view-leaderboard');
        if (lbView && !lbView.classList.contains('hidden')) {
          renderLeaderboard(false);
        }
      });
    } catch (e) {
      console.warn('Firebase realtime listener note:', e);
    }
  }

  function updateAuthUI() {
    const dot = document.getElementById('header-status-dot');
    const syncBanner = document.getElementById('cloud-sync-banner');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatarChar = document.getElementById('profile-avatar-char');
    const profileStatusBadge = document.getElementById('profile-status-badge');
    const authActions = document.getElementById('profile-auth-actions');
    const loggedInControls = document.getElementById('profile-logged-in-controls');
    const authNoticeText = document.getElementById('auth-mode-text');

    if (currentUser) {
      const displayName = currentUser.name || currentUser.email.split('@')[0];
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 ring-2 ring-white dark:ring-slate-900';
      if (profileName) profileName.textContent = displayName;
      if (profileEmail) profileEmail.textContent = currentUser.email;
      if (profileAvatarChar) profileAvatarChar.textContent = displayName.charAt(0).toUpperCase();

      if (currentUser.isCloud) {
        if (syncBanner) syncBanner.classList.remove('hidden');
        if (profileStatusBadge) {
          profileStatusBadge.textContent = 'Cloud Active';
          profileStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400';
        }
      } else {
        if (syncBanner) syncBanner.classList.add('hidden');
        if (profileStatusBadge) {
          profileStatusBadge.textContent = 'Student Account';
          profileStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400';
        }
      }

      if (authActions) authActions.classList.add('hidden');
      if (loggedInControls) loggedInControls.classList.remove('hidden');
    } else {
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1 ring-2 ring-white dark:ring-slate-900';
      if (syncBanner) syncBanner.classList.add('hidden');
      if (profileName) profileName.textContent = 'Guest Student';
      if (profileEmail) profileEmail.textContent = 'Offline Storage Mode';
      if (profileAvatarChar) profileAvatarChar.textContent = 'G';
      if (profileStatusBadge) {
        profileStatusBadge.textContent = 'Guest';
        profileStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400';
      }
      if (authActions) authActions.classList.remove('hidden');
      if (loggedInControls) loggedInControls.classList.add('hidden');
    }

    if (authNoticeText) {
      if (firebaseDb) {
        authNoticeText.textContent = 'Firebase Cloud Realtime Sync is active.';
      } else {
        authNoticeText.textContent = 'Instant Student Account (Works offline & locally).';
      }
    }
  }

  // --- GAMIFICATION ENGINE (XP, LEVELS & STREAKS) ---
  function initGamification() {
    if (!appState.gamification) {
      appState.gamification = {
        xp: 0,
        level: 1,
        streak: 1,
        lastStudyDate: getTodayDate()
      };
    }

    // Check streak
    const today = getTodayDate();
    const lastDate = appState.gamification.lastStudyDate;
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        appState.gamification.streak = (appState.gamification.streak || 1) + 1;
      }
      appState.gamification.lastStudyDate = today;
      saveLocalState();
    }

    renderGamificationUI();
  }

  function addXP(amount, actionLabel) {
    if (!appState.gamification) initGamification();
    const oldLevel = appState.gamification.level;
    appState.gamification.xp = (appState.gamification.xp || 0) + amount;

    let currentTier = LEVEL_TIERS[0];
    for (const tier of LEVEL_TIERS) {
      if (appState.gamification.xp >= tier.minXP) {
        currentTier = tier;
      }
    }
    appState.gamification.level = currentTier.level;

    saveLocalState();
    renderGamificationUI();

    if (currentTier.level > oldLevel) {
      playChime('success');
      triggerCelebration();
      showToast(`🎉 LEVEL UP! You reached Level ${currentTier.level}: ${currentTier.title}!`);
    } else {
      showToast(`+${amount} XP (${actionLabel})`);
    }
  }

  function renderGamificationUI() {
    if (!appState.gamification) return;
    const { xp, level, streak } = appState.gamification;

    const currentTier = LEVEL_TIERS.find(t => t.level === level) || LEVEL_TIERS[LEVEL_TIERS.length - 1];
    const nextTier = LEVEL_TIERS.find(t => t.level === level + 1);

    const levelBadge = document.getElementById('gamify-level-badge');
    const levelTitle = document.getElementById('gamify-level-title');
    const xpText = document.getElementById('gamify-xp-text');
    const xpBar = document.getElementById('gamify-xp-bar');
    const streakCount = document.getElementById('gamify-streak-count');

    if (levelBadge) levelBadge.textContent = `Lv.${level}`;
    if (levelTitle) levelTitle.textContent = currentTier.title;

    if (nextTier) {
      const tierSpan = nextTier.minXP - currentTier.minXP;
      const progressXP = xp - currentTier.minXP;
      const pct = Math.min(100, Math.max(5, Math.round((progressXP / tierSpan) * 100)));
      if (xpText) xpText.textContent = `${xp} / ${nextTier.minXP} XP`;
      if (xpBar) xpBar.style.width = `${pct}%`;
    } else {
      if (xpText) xpText.textContent = `${xp} XP (MAX)`;
      if (xpBar) xpBar.style.width = '100%';
    }

    if (streakCount) streakCount.textContent = streak || 1;
  }

  function showNextStudyTip() {
    currentTipIndex = (currentTipIndex + 1) % STUDY_HACKS.length;
    const tip = STUDY_HACKS[currentTipIndex];
    const tipText = document.getElementById('study-tip-text');
    if (tipText) {
      tipText.innerHTML = `<strong>${tip.title}:</strong> ${tip.text}`;
    }
  }

  const studyTipPill = document.getElementById('study-tip-pill');
  if (studyTipPill) {
    studyTipPill.addEventListener('click', () => {
      showNextStudyTip();
      playChime('chime-soft');
    });
  }

  // --- DAILY STUDY TARGET GOAL ENGINE ---
  let selectedDailyGoalChoice = 4;

  function initDailyGoal() {
    if (!appState.dailyGoal) {
      appState.dailyGoal = {
        target: 4,
        completedToday: 0,
        date: getTodayDate()
      };
    }

    if (appState.dailyGoal.date !== getTodayDate()) {
      appState.dailyGoal.completedToday = 0;
      appState.dailyGoal.date = getTodayDate();
      saveLocalState();
    }

    renderDailyGoalUI();
    initDailyGoalHandlers();
  }

  function renderDailyGoalUI() {
    if (!appState.dailyGoal) return;
    const { target, completedToday } = appState.dailyGoal;
    const progressText = document.getElementById('goal-progress-text');
    const motivateText = document.getElementById('goal-motivate-text');
    const circle = document.getElementById('goal-progress-circle');

    if (progressText) {
      progressText.textContent = `${completedToday} / ${target} Topics`;
    }

    const pct = Math.min(100, Math.round((completedToday / (target || 1)) * 100));
    if (circle) {
      const strokeDash = Math.max(0, 100 - pct);
      circle.style.strokeDashoffset = strokeDash;
      if (pct >= 100) {
        circle.classList.remove('text-emerald-500');
        circle.classList.add('text-amber-400');
      } else {
        circle.classList.remove('text-amber-400');
        circle.classList.add('text-emerald-500');
      }
    }

    if (motivateText) {
      if (completedToday >= target) {
        motivateText.textContent = `🎉 Goal crushed! (${completedToday}/${target} topics finished today). Fantastic work!`;
      } else {
        const remaining = target - completedToday;
        motivateText.textContent = `${remaining} more topic${remaining === 1 ? '' : 's'} to hit today's study target.`;
      }
    }
  }

  function notifyTopicStatusChanged(newStatus, oldStatus) {
    if (!appState.dailyGoal) initDailyGoal();
    
    if (newStatus === 'completed' && oldStatus !== 'completed') {
      appState.dailyGoal.completedToday = (appState.dailyGoal.completedToday || 0) + 1;
      renderDailyGoalUI();
      saveState();

      if (appState.dailyGoal.completedToday === appState.dailyGoal.target) {
        playChime('success');
        triggerCelebration();
        addXP(100, 'Daily Study Goal Achieved!');
        showToast(`🎉 DAILY GOAL CRUSHED! ${appState.dailyGoal.target}/${appState.dailyGoal.target} Topics (+100 XP)`);
      }
    } else if (oldStatus === 'completed' && newStatus !== 'completed') {
      if (appState.dailyGoal.completedToday > 0) {
        appState.dailyGoal.completedToday--;
        renderDailyGoalUI();
        saveState();
      }
    }
  }

  function initDailyGoalHandlers() {
    const btnEditGoal = document.getElementById('btn-edit-daily-goal');
    if (btnEditGoal) {
      btnEditGoal.addEventListener('click', () => {
        selectedDailyGoalChoice = appState.dailyGoal?.target || 4;
        updateDailyGoalModalButtons();
        openModal('modal-daily-goal');
      });
    }

    document.querySelectorAll('.daily-goal-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedDailyGoalChoice = parseInt(btn.dataset.goalVal, 10) || 4;
        updateDailyGoalModalButtons();
      });
    });

    const btnSaveGoal = document.getElementById('btn-save-daily-goal');
    if (btnSaveGoal) {
      btnSaveGoal.addEventListener('click', () => {
        if (!appState.dailyGoal) initDailyGoal();
        appState.dailyGoal.target = selectedDailyGoalChoice;
        saveState();
        renderDailyGoalUI();
        closeModal('modal-daily-goal');
        showToast(`Daily target set to ${selectedDailyGoalChoice} topics! 🎯`);
      });
    }
  }

  function updateDailyGoalModalButtons() {
    document.querySelectorAll('.daily-goal-option-btn').forEach(btn => {
      const val = parseInt(btn.dataset.goalVal, 10);
      if (val === selectedDailyGoalChoice) {
        btn.className = 'daily-goal-option-btn p-3 rounded-xl border-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-center font-bold text-xs transition';
      } else {
        btn.className = 'daily-goal-option-btn p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-bold text-xs hover:border-indigo-500 transition';
      }
    });
  }

  // --- CLOUD SYNC & CROSS-DEVICE ENGINE ---
  function calculateOverallStats() {
    let totalTopics = 0;
    let completedTopics = 0;
    (appState.subjects || []).forEach(sub => {
      (sub.modules || []).forEach(mod => {
        (mod.topics || []).forEach(t => {
          totalTopics++;
          if (t.status === 'completed' || t.completed === true) completedTopics++;
        });
      });
    });
    const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    return { totalTopics, completedTopics, completionPct };
  }

  async function syncToCloudNow() {
    if (!currentUser) return;
    try {
      const { totalTopics, completedTopics, completionPct } = calculateOverallStats();
      const userEmail = currentUser.email ? currentUser.email.toLowerCase().trim() : '';

      // 1. Primary: Firebase Realtime Database Sync (Instant Multi-User & Cross-Device)
      if (firebaseDb && userEmail) {
        try {
          const studentKey = sanitizeFirebaseKey(userEmail);
          const fbPayload = {
            userId: currentUser.id || generateUUID(),
            email: userEmail,
            displayName: currentUser.name || userEmail.split('@')[0],
            level: appState.gamification?.level || 1,
            xp: appState.gamification?.xp || 0,
            streak: appState.gamification?.streak || 1,
            completedTopics: completedTopics,
            totalTopics: totalTopics || 315,
            completionPct: completionPct,
            syllabusData: {
              subjects: appState.subjects,
              gamification: appState.gamification,
              activeSubjectId: appState.activeSubjectId
            },
            updatedAt: Date.now()
          };

          await firebaseDb.ref('students/' + studentKey).set(fbPayload);

          const dot = document.getElementById('header-status-dot');
          if (dot) {
            dot.className = 'w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 ring-2 ring-white dark:ring-slate-900';
            dot.classList.add('ring-4', 'ring-emerald-400');
            setTimeout(() => dot.classList.remove('ring-4', 'ring-emerald-400'), 800);
          }
        } catch (errFb) {
          console.warn('Firebase sync note:', errFb);
        }
      }
    } catch (e) {
      console.warn('Sync to cloud error:', e);
    }
  }

  async function loadStudentCloudData() {
    if (!currentUser) return;
    const userEmail = currentUser.email ? currentUser.email.toLowerCase().trim() : '';
    if (!userEmail) return;

    showToast('Syncing your saved progress...', 'cloud');

    // 1. Primary: Load from Firebase Realtime Database
    if (firebaseDb) {
      try {
        const studentKey = sanitizeFirebaseKey(userEmail);
        const snapshot = await firebaseDb.ref('students/' + studentKey).once('value');
        const data = snapshot.val();
        if (data && data.syllabusData && data.syllabusData.subjects && data.syllabusData.subjects.length > 0) {
          appState.subjects = data.syllabusData.subjects;
          if (data.syllabusData.gamification) {
            appState.gamification = data.syllabusData.gamification;
          } else {
            appState.gamification = {
              xp: data.xp || 0,
              level: data.level || 1,
              streak: data.streak || 1,
              lastStudyDate: getTodayDate()
            };
          }
          if (data.syllabusData.activeSubjectId) {
            appState.activeSubjectId = data.syllabusData.activeSubjectId;
          } else {
            appState.activeSubjectId = appState.subjects[0]?.id || null;
          }
          saveLocalState();
          renderSubjectSelector();
          renderHeroBanner();
          renderStats();
          renderModulesAndTopics();
          populateTimerTopics();
          renderGamificationUI();
          renderLeaderboard();
          showToast(`Progress restored for ${currentUser.name}! ☁️`);
          return;
        } else {
          // If profile is fresh, sync initial syllabus to cloud
          syncToCloudNow();
        }
      } catch (errFb) {
        console.warn('Firebase restore note:', errFb);
      }
    }
  }

  // --- AUDIO SYNTHESIZER ---
  function playChime(type = 'success') {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'success') {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
        });
      } else if (type === 'chime-soft') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 587.33; // D5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'timer-done') {
        const freqs = [880, 880, 880];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.25);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.25 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.25);
          osc.stop(ctx.currentTime + idx * 0.25 + 0.22);
        });
      }
    } catch (e) {}
  }

  function triggerCelebration() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 }
      });
    }
  }

  // --- PERSISTENCE ---
  function loadLocalState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.subjects && Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
          // Self-heal: ensure every subject has its default modules if empty
          parsed.subjects.forEach(sub => {
            if (!sub.modules || sub.modules.length === 0) {
              const def = DEFAULT_DATA.subjects.find(d => d.id === sub.id || d.code === sub.code);
              if (def && def.modules) {
                sub.modules = JSON.parse(JSON.stringify(def.modules));
              }
            }
          });
          return parsed;
        }
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  function saveLocalState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  let cloudSyncTimeout = null;
  function scheduleCloudSync() {
    if (!currentUser) return;
    if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
    cloudSyncTimeout = setTimeout(() => {
      syncToCloudNow();
    }, 400);
  }

  function saveState() {
    saveLocalState();
    scheduleCloudSync();
  }

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
      syncToCloudNow();
    }
  });

  window.addEventListener('beforeunload', () => {
    syncToCloudNow();
  });

  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.remove('opacity-0', '-translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');
    
    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-4');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, 2200);
  }

  // --- GETTERS & METRICS ---
  function getActiveSubject() {
    if (!appState.subjects || appState.subjects.length === 0) {
      appState.subjects = JSON.parse(JSON.stringify(DEFAULT_DATA.subjects));
      appState.activeSubjectId = appState.subjects[0].id;
    }
    let subject = appState.subjects.find(s => s.id === appState.activeSubjectId);
    if (!subject) {
      subject = appState.subjects[0];
      appState.activeSubjectId = subject ? subject.id : 'sub_gymat301';
    }
    // Self-healing: If the active course has missing or empty modules, restore from official syllabus!
    if (subject && (!subject.modules || subject.modules.length === 0)) {
      const defaultSub = DEFAULT_DATA.subjects.find(d => d.id === subject.id || d.code === subject.code);
      if (defaultSub && defaultSub.modules && defaultSub.modules.length > 0) {
        subject.modules = JSON.parse(JSON.stringify(defaultSub.modules));
        saveLocalState();
      }
    }
    return subject;
  }

  function getSubjectStats(subject) {
    if (!subject || !subject.modules) {
      return {
        totalModules: 0,
        completedModules: 0,
        inProgressModules: 0,
        totalTopics: 0,
        completedTopics: 0,
        completionPct: 0,
        r1Count: 0,
        r2Count: 0,
        r3Count: 0,
        totalRevisions: 0,
        totalTimeSpentMinutes: 0,
        avgConfidence: '0'
      };
    }

    let totalTopics = 0;
    let completedTopics = 0;
    let r1Count = 0;
    let r2Count = 0;
    let r3Count = 0;
    let totalTimeSpentMinutes = 0;
    let sumConfidence = 0;
    let ratedTopicsCount = 0;
    let completedModules = 0;
    let inProgressModules = 0;

    subject.modules.forEach(mod => {
      const modTopics = mod.topics || [];
      const modTotal = modTopics.length;
      let modCompleted = 0;

      modTopics.forEach(t => {
        totalTopics++;
        if (t.status === 'completed' || t.completed === true) {
          completedTopics++;
          modCompleted++;
        }
        if (t.revisions) {
          if (t.revisions.r1) r1Count++;
          if (t.revisions.r2) r2Count++;
          if (t.revisions.r3) r3Count++;
        }
        if (t.timeSpentMinutes) {
          totalTimeSpentMinutes += t.timeSpentMinutes;
        }
        if (t.confidence && t.confidence > 0) {
          sumConfidence += t.confidence;
          ratedTopicsCount++;
        }
      });

      if (modTotal > 0 && modCompleted === modTotal) {
        completedModules++;
      } else if (modCompleted > 0 || modTopics.some(t => t.status === 'in-progress')) {
        inProgressModules++;
      }
    });

    const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const avgConfidence = ratedTopicsCount > 0 ? (sumConfidence / ratedTopicsCount).toFixed(1) : '0';

    return {
      totalModules: subject.modules.length,
      completedModules,
      inProgressModules,
      totalTopics,
      completedTopics,
      completionPct,
      r1Count,
      r2Count,
      r3Count,
      totalRevisions: r1Count + r2Count + r3Count,
      totalTimeSpentMinutes,
      avgConfidence
    };
  }

  // --- MOBILE BOTTOM TAB SWITCHER ---
  function switchMobileTab(targetTab) {
    currentActiveTab = targetTab;
    const screens = {
      syllabus: document.getElementById('screen-syllabus'),
      timer: document.getElementById('screen-timer'),
      leaderboard: document.getElementById('screen-leaderboard'),
      analytics: document.getElementById('screen-analytics'),
      profile: document.getElementById('screen-profile')
    };

    Object.keys(screens).forEach(tab => {
      if (screens[tab]) {
        if (tab === targetTab) {
          screens[tab].classList.remove('hidden');
        } else {
          screens[tab].classList.add('hidden');
        }
      }
    });

    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
      const tab = btn.dataset.targetTab;
      if (tab === targetTab) {
        btn.className = 'mobile-tab-btn flex flex-col items-center justify-center flex-1 py-1.5 px-1 quantix-nav-active text-white touch-press transition';
      } else {
        btn.className = 'mobile-tab-btn flex flex-col items-center justify-center flex-1 py-1.5 px-1 text-slate-400 hover:text-slate-200 touch-press transition';
      }
    });

    if (targetTab === 'timer') {
      populateTimerTopics();
      updatePomodoroDisplay();
    } else if (targetTab === 'leaderboard') {
      renderLeaderboard();
    } else if (targetTab === 'analytics') {
      renderStats();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMobileTab(btn.dataset.targetTab));
  });

  const headerAvatarBtn = document.getElementById('header-avatar-btn');
  if (headerAvatarBtn) {
    headerAvatarBtn.addEventListener('click', () => switchMobileTab('profile'));
  }

  // --- RENDER FUNCTIONS ---
  function renderSubjectSelector() {
    const selector = document.getElementById('subject-selector');
    if (!selector) return;

    selector.innerHTML = '';
    if (!appState.subjects || appState.subjects.length === 0) {
      selector.innerHTML = '<option value="">+ No Course (Tap + to add)</option>';
      const aiOptEmpty = document.createElement('option');
      aiOptEmpty.value = '__ai_add_course__';
      aiOptEmpty.textContent = '✨ + AI Add Course from Text...';
      selector.appendChild(aiOptEmpty);
      return;
    }

    appState.subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = `${sub.code ? sub.code + ': ' : ''}${sub.name}`;
      if (sub.id === appState.activeSubjectId) {
        opt.selected = true;
      }
      selector.appendChild(opt);
    });

    const aiOpt = document.createElement('option');
    aiOpt.value = '__ai_add_course__';
    aiOpt.textContent = '✨ + AI Add Course from Text...';
    selector.appendChild(aiOpt);
  }

  function renderHeroBanner() {
    const subject = getActiveSubject();
    const heroCard = document.getElementById('subject-banner');
    const urgencyBanner = document.getElementById('exam-urgency-banner');
    const urgencyText = document.getElementById('exam-urgency-text');
    const countdownPill = document.getElementById('btn-hero-exam-pill');
    const countdownText = document.getElementById('exam-countdown-text');
    const analyticsExamDate = document.getElementById('analytics-exam-date');

    if (!subject) {
      if (heroCard) {
        document.getElementById('subject-title').textContent = 'No Course Selected';
        document.getElementById('subject-desc').textContent = 'Add your first subject syllabus using the "+" button.';
        document.getElementById('subject-code-badge').textContent = 'START';
      }
      if (countdownText) countdownText.textContent = 'Set Exam Date';
      if (urgencyBanner) urgencyBanner.classList.add('hidden');
      if (analyticsExamDate) analyticsExamDate.textContent = 'No Subject';
      return;
    }

    document.getElementById('subject-title').textContent = subject.name;
    document.getElementById('subject-desc').textContent = subject.description || 'Module syllabus & review.';
    document.getElementById('subject-code-badge').textContent = subject.code || 'COURSE';

    // Exam Awareness & Days Remaining
    if (subject.examDate) {
      const examDate = new Date(subject.examDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      examDate.setHours(0, 0, 0, 0);
      const diffTime = examDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (analyticsExamDate) {
        analyticsExamDate.textContent = `${subject.examDate} (${diffDays > 0 ? diffDays + ' days left' : 'Today/Passed'})`;
      }

      if (diffDays > 0) {
        countdownText.textContent = `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
        countdownPill.className = 'flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 shadow-sm touch-press';

        if (diffDays <= 3) {
          urgencyText.textContent = `⚠️ EXAM IN ${diffDays} DAYS! Final Revision Mode: Focus on high priority topics!`;
          urgencyBanner.classList.remove('hidden');
        } else if (diffDays <= 7) {
          urgencyText.textContent = `⚡ 1 Week Remaining: Complete Revision Passes (R2 & R3).`;
          urgencyBanner.classList.remove('hidden');
        } else {
          urgencyBanner.classList.add('hidden');
        }
      } else if (diffDays === 0) {
        countdownText.textContent = `🔥 Exam is TODAY!`;
        countdownPill.className = 'flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-500 text-white shadow-md touch-press animate-pulse';
        urgencyText.textContent = `🎯 Final Exam Day! Stay calm, trust your preparation. You've got this!`;
        urgencyBanner.classList.remove('hidden');
      } else {
        countdownText.textContent = `Exam Passed`;
        countdownPill.className = 'flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 text-white shadow-sm touch-press';
        urgencyBanner.classList.add('hidden');
      }
    } else {
      countdownText.textContent = 'Set Exam Date';
      countdownPill.className = 'flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/80 text-white border border-white/20 touch-press';
      if (urgencyBanner) urgencyBanner.classList.add('hidden');
      if (analyticsExamDate) analyticsExamDate.textContent = 'Not Scheduled';
    }
  }

  function renderStats() {
    const subject = getActiveSubject();
    const stats = getSubjectStats(subject);

    const compPct = document.getElementById('stat-completion-pct');
    if (compPct) compPct.textContent = `${stats.completionPct}%`;
    const topFrac = document.getElementById('stat-topics-fraction');
    if (topFrac) topFrac.textContent = `(${stats.completedTopics}/${stats.totalTopics} topics)`;
    const progBar = document.getElementById('stat-progress-bar');
    if (progBar) progBar.style.width = `${stats.completionPct}%`;

    const modComp = document.getElementById('stat-modules-completed');
    if (modComp) modComp.textContent = stats.completedModules;
    const modTot = document.getElementById('stat-modules-total');
    if (modTot) modTot.textContent = `/ ${stats.totalModules} units`;
    const inProgText = document.getElementById('stat-in-progress-text');
    if (inProgText) inProgText.textContent = `${stats.inProgressModules} modules active`;

    const revCount = document.getElementById('stat-revision-count');
    if (revCount) revCount.textContent = `${stats.totalRevisions} total`;
    const bRev1 = document.getElementById('badge-rev-1');
    if (bRev1) bRev1.textContent = stats.r1Count;
    const bRev2 = document.getElementById('badge-rev-2');
    if (bRev2) bRev2.textContent = stats.r2Count;
    const bRev3 = document.getElementById('badge-rev-3');
    if (bRev3) bRev3.textContent = stats.r3Count;

    const hours = (stats.totalTimeSpentMinutes / 60).toFixed(1);
    const studyTime = document.getElementById('stat-study-time');
    if (studyTime) studyTime.textContent = `${hours}h`;
    const avgConf = document.getElementById('stat-avg-confidence');
    if (avgConf) avgConf.textContent = `${stats.avgConfidence} / 5`;

    renderExamTimetable();
  }

  function renderExamTimetable() {
    const list = document.getElementById('exam-timetable-list');
    if (!list) return;

    if (!appState.subjects || appState.subjects.length === 0) {
      list.innerHTML = `<div class="p-3 text-center text-xs text-slate-400">No courses in syllabus</div>`;
      return;
    }

    const subjects = [...appState.subjects];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    subjects.sort((a, b) => {
      if (a.examDate && b.examDate) {
        return new Date(a.examDate) - new Date(b.examDate);
      }
      if (a.examDate && !b.examDate) return -1;
      if (!a.examDate && b.examDate) return 1;
      return a.name.localeCompare(b.name);
    });

    list.innerHTML = subjects.map(sub => {
      let countdownHtml = '';
      let dateDisplay = 'Date Not Set';
      let urgencyClass = 'bg-slate-100 dark:bg-slate-800 text-slate-500';

      if (sub.examDate) {
        const examDateObj = new Date(sub.examDate + 'T00:00:00');
        const diffMs = examDateObj - today;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        dateDisplay = examDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        if (diffDays === 0) {
          countdownHtml = '🔥 Exam is TODAY!';
          urgencyClass = 'bg-rose-500 text-white font-black urgent-alert';
        } else if (diffDays > 0) {
          countdownHtml = `⏳ ${diffDays} day${diffDays === 1 ? '' : 's'} left`;
          if (diffDays <= 3) {
            urgencyClass = 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-black urgent-alert border border-rose-300 dark:border-rose-800';
          } else if (diffDays <= 7) {
            urgencyClass = 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-extrabold border border-amber-300 dark:border-amber-800';
          } else {
            urgencyClass = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold';
          }
        } else {
          countdownHtml = 'Completed';
          urgencyClass = 'bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold';
        }
      }

      let subTopics = 0;
      let subCompleted = 0;
      (sub.modules || []).forEach(m => {
        (m.topics || []).forEach(t => {
          subTopics++;
          if (t.status === 'completed') subCompleted++;
        });
      });
      const subPct = subTopics > 0 ? Math.round((subCompleted / subTopics) * 100) : 0;

      return `
        <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0 pr-2">
              <div class="flex items-center space-x-1.5 mb-0.5">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase">
                  ${escapeHtml(sub.code || 'COURSE')}
                </span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  ${escapeHtml(sub.name)}
                </span>
              </div>
              <p class="text-[10px] text-slate-400">Exam: <strong class="text-slate-600 dark:text-slate-300">${dateDisplay}</strong></p>
            </div>
            
            <button data-exam-subject-id="${sub.id}" class="btn-quick-set-exam-date px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shadow-2xs hover:bg-slate-100 shrink-0 touch-press">
              ${sub.examDate ? 'Change Date' : 'Set Date'}
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex-1 mr-3">
              <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="bg-indigo-600 h-full rounded-full transition-all" style="width: ${subPct}%"></div>
              </div>
              <div class="flex justify-between text-[9px] text-slate-400 mt-0.5">
                <span>${subCompleted}/${subTopics} topics</span>
                <span>${subPct}% ready</span>
              </div>
            </div>
            ${sub.examDate ? `<span class="px-2 py-0.5 rounded-full text-[10px] ${urgencyClass} shrink-0">${countdownHtml}</span>` : '<span class="text-[10px] text-slate-400 italic">No date</span>'}
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.btn-quick-set-exam-date').forEach(btn => {
      btn.addEventListener('click', () => {
        const subId = btn.dataset.examSubjectId;
        const sub = appState.subjects.find(s => s.id === subId);
        if (!sub) return;
        const newDate = prompt(`Enter Exam Date for ${sub.code || sub.name} (YYYY-MM-DD):`, sub.examDate || '2026-12-15');
        if (newDate !== null) {
          sub.examDate = newDate.trim();
          saveState();
          renderStats();
          renderHeroBanner();
          renderExamTimetable();
          showToast(`Exam date updated for ${sub.code || sub.name}! 📅`);
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function renderModulesAndTopics() {
    const container = document.getElementById('modules-container');
    const emptyState = document.getElementById('empty-state');
    if (!container) return;

    let subject = getActiveSubject();
    if (!subject || !subject.modules || subject.modules.length === 0) {
      const defSub = DEFAULT_DATA.subjects.find(d => subject && (d.id === subject.id || d.code === subject.code));
      if (defSub && defSub.modules && defSub.modules.length > 0) {
        if (subject) {
          subject.modules = JSON.parse(JSON.stringify(defSub.modules));
        } else {
          appState.subjects = JSON.parse(JSON.stringify(DEFAULT_DATA.subjects));
          subject = appState.subjects[0];
        }
        saveLocalState();
      }
    }

    if (!subject || !subject.modules || subject.modules.length === 0) {
      container.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-800">
          <i data-lucide="layers" class="w-8 h-8 text-indigo-500 mx-auto mb-2"></i>
          <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">${!subject ? 'No courses added yet' : 'Empty Syllabus'}</h4>
          <p class="text-xs text-slate-400 mt-1 max-w-xs mx-auto">${!subject ? 'Tap "+" above to add your first course.' : 'Tap "+" above to add modules or import your syllabus outline.'}</p>
        </div>
      `;
      if (emptyState) emptyState.classList.add('hidden');
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = '';
    let totalVisibleTopics = 0;

    subject.modules.forEach(mod => {
      const modTopics = mod.topics || [];
      const totalModTopics = modTopics.length;
      const completedModTopics = modTopics.filter(t => t.status === 'completed').length;
      const modPct = totalModTopics > 0 ? Math.round((completedModTopics / totalModTopics) * 100) : 0;

      const filteredTopics = modTopics.filter(topic => {
        if (currentFilter.status !== 'all' && currentFilter.status !== topic.status) return false;
        if (currentFilter.search) {
          const q = currentFilter.search.toLowerCase();
          const matchName = topic.name.toLowerCase().includes(q);
          const matchDesc = topic.description && topic.description.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        return true;
      });

      totalVisibleTopics += filteredTopics.length;
      const isFiltering = currentFilter.status !== 'all' || currentFilter.search !== '';
      if (isFiltering && filteredTopics.length === 0) return;

      const isCollapsed = collapsedModules.has(mod.id);

      const moduleCard = document.createElement('div');
      moduleCard.className = 'bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800 transition-all';
      moduleCard.dataset.moduleId = mod.id;

      moduleCard.innerHTML = `
        <div class="p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40">
          <div class="flex items-center space-x-2 flex-1 min-w-0 toggle-module-btn cursor-pointer" data-module-id="${mod.id}">
            <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="w-4 h-4 text-slate-400 shrink-0"></i>
            <div class="min-w-0">
              <h3 class="font-extrabold text-xs text-slate-800 dark:text-slate-100 truncate">${escapeHtml(mod.name)}</h3>
              <p class="text-[10px] text-slate-400">${completedModTopics}/${totalModTopics} done • ${modPct}%</p>
            </div>
          </div>

          <div class="flex items-center space-x-1 shrink-0">
            <button title="Mark module done" class="btn-complete-module p-1.5 text-slate-400 hover:text-emerald-500 touch-press" data-module-id="${mod.id}">
              <i data-lucide="check-check" class="w-4 h-4"></i>
            </button>
            <button title="Add topic" class="btn-add-topic-to-mod p-1.5 text-slate-400 hover:text-indigo-600 touch-press" data-module-id="${mod.id}">
              <i data-lucide="plus" class="w-4 h-4"></i>
            </button>
            <button title="Delete module" class="btn-delete-module p-1.5 text-slate-400 hover:text-rose-500 touch-press" data-module-id="${mod.id}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div class="module-content ${isCollapsed ? 'hidden' : 'block'} p-3 space-y-2">
          ${filteredTopics.length > 0 ? `
            <div class="space-y-2">
              ${filteredTopics.map(topic => renderTopicCardHtml(topic, mod.id)).join('')}
            </div>
          ` : `
            <div class="py-4 text-center text-[11px] text-slate-400">
              ${totalModTopics === 0 ? 'No topics in this module. Tap "+" to add one.' : 'No topics match current filter.'}
            </div>
          `}
        </div>
      `;

      container.appendChild(moduleCard);
    });

    if (emptyState) {
      if (totalVisibleTopics === 0 && subject.modules.length > 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }

    if (window.lucide) window.lucide.createIcons();
    bindModuleAndTopicEvents();
  }

  function renderTopicCardHtml(topic, moduleId) {
    const statusConfig = {
      'completed': {
        badgeClass: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300',
        label: 'Done',
        icon: 'check-circle'
      },
      'in-progress': {
        badgeClass: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300',
        label: 'In Prog',
        icon: 'clock'
      },
      'needs-revision': {
        badgeClass: 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300',
        label: 'Revise',
        icon: 'alert-circle'
      },
      'not-started': {
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
        label: 'Pending',
        icon: 'circle'
      }
    };

    const currentStatus = statusConfig[topic.status] || statusConfig['not-started'];

    let starsHtml = '';
    const rating = topic.confidence || 0;
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      starsHtml += `
        <span class="star-btn ${isFilled ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}" 
              data-topic-id="${topic.id}" data-rating="${i}">★</span>
      `;
    }

    const r1 = topic.revisions && topic.revisions.r1;
    const r2 = topic.revisions && topic.revisions.r2;
    const r3 = topic.revisions && topic.revisions.r3;

    return `
      <div class="topic-card bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-200/70 dark:border-slate-800 space-y-2" data-topic-id="${topic.id}" data-module-id="${moduleId}">
        
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-start space-x-2 min-w-0 flex-1">
            <button class="btn-cycle-status shrink-0 mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center space-x-1 ${currentStatus.badgeClass} touch-press" data-topic-id="${topic.id}">
              <i data-lucide="${currentStatus.icon}" class="w-3 h-3"></i>
              <span>${currentStatus.label}</span>
            </button>
            <div class="min-w-0">
              <h4 class="font-extrabold text-xs text-slate-800 dark:text-slate-100 leading-snug ${topic.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''}">${escapeHtml(topic.name)}</h4>
              ${topic.description ? `<p class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">${escapeHtml(topic.description)}</p>` : ''}
            </div>
          </div>

          <div class="flex items-center space-x-0.5 shrink-0">
            <button class="btn-open-notes text-slate-400 hover:text-indigo-600 p-1 shrink-0 touch-press" data-topic-id="${topic.id}" title="Study Notes">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            </button>
            <button class="btn-delete-topic text-slate-400 hover:text-rose-500 p-1 shrink-0 touch-press" data-topic-id="${topic.id}" title="Delete Topic">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-slate-800/60">
          <div class="flex items-center space-x-0.5">
            <button class="btn-toggle-revision px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${r1 ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}" data-topic-id="${topic.id}" data-rev="r1">R1</button>
            <button class="btn-toggle-revision px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${r2 ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}" data-topic-id="${topic.id}" data-rev="r2">R2</button>
            <button class="btn-toggle-revision px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${r3 ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}" data-topic-id="${topic.id}" data-rev="r3">R3</button>
          </div>

          <div class="flex items-center text-xs select-none">
            ${starsHtml}
          </div>

          <button class="btn-topic-pomodoro flex items-center space-x-1 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md touch-press" data-topic-id="${topic.id}" data-topic-name="${escapeHtml(topic.name)}">
            <i data-lucide="timer" class="w-3 h-3"></i>
            <span>Focus</span>
          </button>
        </div>

      </div>
    `;
  }

  // --- TOPIC STATUS & REVISION HANDLERS ---
  function findTopicAndModule(topicId) {
    const subject = getActiveSubject();
    if (!subject || !subject.modules) return null;
    for (const mod of subject.modules) {
      const topic = mod.topics.find(t => t.id === topicId);
      if (topic) return { topic, module: mod, subject };
    }
    return null;
  }

  function cycleTopicStatus(topicId) {
    const res = findTopicAndModule(topicId);
    if (!res) return;

    const oldStatus = res.topic.status || 'not-started';
    const seq = ['not-started', 'in-progress', 'completed', 'needs-revision'];
    const idx = seq.indexOf(oldStatus);
    const next = seq[(idx + 1) % seq.length];
    res.topic.status = next;
    res.topic.completed = (next === 'completed');

    notifyTopicStatusChanged(next, oldStatus);

    if (next === 'completed') {
      if (!res.topic.revisions) res.topic.revisions = {};
      if (!res.topic.revisions.r1) res.topic.revisions.r1 = true;
      playChime('success');
      addXP(50, 'Completed Topic');
    } else {
      showToast(`Status: ${next.replace('-', ' ')}`);
    }

    saveState();
    renderStats();
    renderHeroBanner();
    renderModulesAndTopics();
    renderLeaderboard();
  }

  function toggleTopicRevision(topicId, revKey) {
    const res = findTopicAndModule(topicId);
    if (!res) return;
    if (!res.topic.revisions) res.topic.revisions = {};
    res.topic.revisions[revKey] = !res.topic.revisions[revKey];

    if (res.topic.revisions[revKey]) {
      addXP(25, `Revision ${revKey.toUpperCase()}`);
    } else {
      showToast(`Revision ${revKey.toUpperCase()} updated`);
    }

    saveState();
    renderStats();
    renderModulesAndTopics();
  }

  function setTopicConfidence(topicId, rating) {
    const res = findTopicAndModule(topicId);
    if (!res) return;
    res.topic.confidence = res.topic.confidence === rating ? 0 : rating;

    if (res.topic.confidence > 0) {
      addXP(10, `${res.topic.confidence}★ Mastery`);
    }

    saveState();
    renderStats();
    renderModulesAndTopics();
  }

  function bindModuleAndTopicEvents() {
    document.querySelectorAll('.toggle-module-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modId = btn.dataset.moduleId;
        if (collapsedModules.has(modId)) {
          collapsedModules.delete(modId);
        } else {
          collapsedModules.add(modId);
        }
        renderModulesAndTopics();
      });
    });

    document.querySelectorAll('.btn-complete-module').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const modId = btn.dataset.moduleId;
        const subject = getActiveSubject();
        const mod = subject.modules.find(m => m.id === modId);
        if (mod && mod.topics) {
          const allDone = mod.topics.every(t => t.status === 'completed');
          const newStatus = allDone ? 'not-started' : 'completed';
          mod.topics.forEach(t => {
            t.status = newStatus;
            t.completed = (newStatus === 'completed');
            if (newStatus === 'completed') {
              if (!t.revisions) t.revisions = {};
              t.revisions.r1 = true;
            }
          });
          saveState();
          renderStats();
          renderModulesAndTopics();
          if (newStatus === 'completed') {
            playChime('success');
            triggerCelebration();
            addXP(150, 'Module Mastered!');
          }
        }
      });
    });

    document.querySelectorAll('.btn-add-topic-to-mod').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openAddTopicModal(btn.dataset.moduleId);
      });
    });

    document.querySelectorAll('.btn-cycle-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        cycleTopicStatus(btn.dataset.topicId);
      });
    });

    document.querySelectorAll('.btn-toggle-revision').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTopicRevision(btn.dataset.topicId, btn.dataset.rev);
      });
    });

    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setTopicConfidence(btn.dataset.topicId, parseInt(btn.dataset.rating, 10));
      });
    });

    document.querySelectorAll('.btn-open-notes').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openNotesModal(btn.dataset.topicId);
      });
    });

    document.querySelectorAll('.btn-topic-pomodoro').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        startPomodoroForTopic(btn.dataset.topicId, btn.dataset.topicName);
      });
    });

    document.querySelectorAll('.btn-delete-module').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteModule(btn.dataset.moduleId);
      });
    });

    document.querySelectorAll('.btn-delete-topic').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTopic(btn.dataset.topicId);
      });
    });
  }

  function deleteModule(moduleId) {
    const subject = getActiveSubject();
    if (!subject || !subject.modules) return;
    const modIdx = subject.modules.findIndex(m => m.id === moduleId);
    if (modIdx === -1) return;
    const mod = subject.modules[modIdx];

    if (confirm(`Delete "${mod.name}" and all its ${mod.topics?.length || 0} topics?`)) {
      subject.modules.splice(modIdx, 1);
      saveState();
      renderHeroBanner();
      renderStats();
      renderModulesAndTopics();
      populateTimerTopics();
      renderLeaderboard();
      showToast('Module deleted 🗑️');
    }
  }

  function deleteTopic(topicId) {
    const res = findTopicAndModule(topicId);
    if (!res) return;
    const { topic, module } = res;

    if (confirm(`Delete topic "${topic.name}"?`)) {
      module.topics = module.topics.filter(t => t.id !== topicId);
      saveState();
      renderHeroBanner();
      renderStats();
      renderModulesAndTopics();
      populateTimerTopics();
      renderLeaderboard();
      showToast('Topic deleted 🗑️');
    }
  }

  function deleteCurrentCourse() {
    const subject = getActiveSubject();
    if (!subject) {
      alert('No active course to delete.');
      return;
    }
    const name = `${subject.code ? subject.code + ': ' : ''}${subject.name}`;
    if (confirm(`Are you sure you want to delete "${name}" and all its syllabus modules?`)) {
      appState.subjects = (appState.subjects || []).filter(s => s.id !== subject.id);
      appState.activeSubjectId = appState.subjects[0]?.id || null;
      saveState();
      renderSubjectSelector();
      renderHeroBanner();
      renderStats();
      renderModulesAndTopics();
      populateTimerTopics();
      renderLeaderboard();
      showToast('Course deleted 🗑️');
    }
  }

  // --- POMODORO FOCUS TIMER (MOBILE SCREEN) ---
  let pomodoroInterval = null;
  let pomodoroSecondsLeft = 25 * 60;
  let pomodoroTotalDuration = 25 * 60;
  let isPomodoroRunning = false;
  let pomodoroActiveTopicId = null;

  function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroSecondsLeft / 60);
    const seconds = pomodoroSecondsLeft % 60;
    const str = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const display = document.getElementById('pomodoro-timer');
    if (display) display.textContent = str;

    const ring = document.getElementById('timer-progress-ring');
    if (ring) {
      const circumference = 276.46; // 2 * pi * 44
      const progressFraction = pomodoroSecondsLeft / pomodoroTotalDuration;
      const offset = circumference * (1 - progressFraction);
      ring.style.strokeDashoffset = offset;
    }

    const navDot = document.getElementById('nav-timer-indicator');
    if (navDot) {
      if (isPomodoroRunning) navDot.classList.remove('hidden');
      else navDot.classList.add('hidden');
    }
  }

  function startPomodoro() {
    if (isPomodoroRunning) return;
    isPomodoroRunning = true;

    document.getElementById('pomo-play-text').textContent = 'Pause';
    const icon = document.getElementById('pomo-play-icon');
    if (icon) icon.setAttribute('data-lucide', 'pause');
    if (window.lucide) window.lucide.createIcons();

    pomodoroInterval = setInterval(() => {
      if (pomodoroSecondsLeft > 0) {
        pomodoroSecondsLeft--;
        updatePomodoroDisplay();
      } else {
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
        playChime('timer-done');
        triggerCelebration();

        addXP(100, '25m Focus Session');

        if (pomodoroActiveTopicId) {
          const res = findTopicAndModule(pomodoroActiveTopicId);
          if (res) {
            const mins = Math.round(pomodoroTotalDuration / 60);
            res.topic.timeSpentMinutes = (res.topic.timeSpentMinutes || 0) + mins;
            if (res.topic.status === 'not-started') res.topic.status = 'in-progress';
            saveState();
            renderStats();
            renderModulesAndTopics();
            showToast(`Logged +${mins}m to "${res.topic.name}"`);
          }
        }
        resetPomodoro(false);
      }
    }, 1000);
  }

  function pausePomodoro() {
    if (!isPomodoroRunning) return;
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    document.getElementById('pomo-play-text').textContent = 'Resume';
    const icon = document.getElementById('pomo-play-icon');
    if (icon) icon.setAttribute('data-lucide', 'play');
    if (window.lucide) window.lucide.createIcons();
    updatePomodoroDisplay();
  }

  function resetPomodoro(resetTime = true) {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    if (resetTime) {
      pomodoroSecondsLeft = pomodoroTotalDuration;
    }
    document.getElementById('pomo-play-text').textContent = 'Start Focus';
    const icon = document.getElementById('pomo-play-icon');
    if (icon) icon.setAttribute('data-lucide', 'play');
    if (window.lucide) window.lucide.createIcons();
    updatePomodoroDisplay();
  }

  function startPomodoroForTopic(topicId, topicName) {
    pomodoroActiveTopicId = topicId;
    document.getElementById('pomodoro-active-topic').textContent = `Topic: ${topicName}`;
    switchMobileTab('timer');
    const select = document.getElementById('timer-topic-select');
    if (select) select.value = topicId;
    resetPomodoro(true);
    startPomodoro();
  }

  function populateTimerTopics() {
    const select = document.getElementById('timer-topic-select');
    if (!select) return;
    const subject = getActiveSubject();
    select.innerHTML = '<option value="">-- General Revision (No Topic) --</option>';
    if (subject && subject.modules) {
      subject.modules.forEach(m => {
        m.topics.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t.id;
          opt.textContent = `${m.name.split(':')[0]}: ${t.name}`;
          if (t.id === pomodoroActiveTopicId) opt.selected = true;
          select.appendChild(opt);
        });
      });
    }
  }

  const selectTimerTopic = document.getElementById('timer-topic-select');
  if (selectTimerTopic) {
    selectTimerTopic.addEventListener('change', (e) => {
      pomodoroActiveTopicId = e.target.value || null;
      if (pomodoroActiveTopicId) {
        const res = findTopicAndModule(pomodoroActiveTopicId);
        if (res) document.getElementById('pomodoro-active-topic').textContent = `Topic: ${res.topic.name}`;
      } else {
        document.getElementById('pomodoro-active-topic').textContent = 'Session: General Syllabus Revision';
      }
    });
  }

  document.getElementById('btn-pomo-toggle').addEventListener('click', () => {
    if (isPomodoroRunning) pausePomodoro();
    else startPomodoro();
  });

  document.getElementById('btn-pomo-reset').addEventListener('click', () => {
    resetPomodoro(true);
  });

  document.getElementById('pomo-mode-focus').addEventListener('click', function () {
    setPomodoroMode(25 * 60, this);
  });
  document.getElementById('pomo-mode-short').addEventListener('click', function () {
    setPomodoroMode(5 * 60, this);
  });
  document.getElementById('pomo-mode-long').addEventListener('click', function () {
    setPomodoroMode(15 * 60, this);
  });

  function setPomodoroMode(seconds, activeBtn) {
    pomodoroTotalDuration = seconds;
    pomodoroSecondsLeft = seconds;
    resetPomodoro(true);

    const buttons = [
      document.getElementById('pomo-mode-focus'),
      document.getElementById('pomo-mode-short'),
      document.getElementById('pomo-mode-long')
    ];
    buttons.forEach(btn => {
      btn.className = 'flex-1 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200';
    });
    activeBtn.className = 'flex-1 py-1.5 rounded-xl bg-indigo-600 text-white shadow-xs font-bold';
  }

  // --- MOBILE BOTTOM SHEETS ---
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[id^="modal-"]').forEach(m => m.classList.add('hidden'));
    });
  });

  document.querySelectorAll('[id^="modal-"]').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });

  // Quick Actions Button
  const btnOpenQuick = document.getElementById('btn-open-quick-actions');
  if (btnOpenQuick) {
    btnOpenQuick.addEventListener('click', () => openModal('modal-quick-actions'));
  }

  document.getElementById('btn-sheet-add-topic').addEventListener('click', () => {
    closeModal('modal-quick-actions');
    openAddTopicModal();
  });
  document.getElementById('btn-sheet-add-module').addEventListener('click', () => {
    closeModal('modal-quick-actions');
    openAddModuleModal();
  });
  const btnSheetImport = document.getElementById('btn-sheet-import');
  if (btnSheetImport) {
    btnSheetImport.addEventListener('click', () => {
      closeModal('modal-quick-actions');
      openModal('modal-quick-import');
    });
  }
  document.getElementById('btn-sheet-add-subject').addEventListener('click', () => {
    closeModal('modal-quick-actions');
    openAddSubjectModal();
  });

  // --- 1. TOPIC MODAL ---
  function populateTopicModuleSelect(selectedModuleId) {
    const subject = getActiveSubject();
    const select = document.getElementById('input-topic-module-select');
    select.innerHTML = '';
    if (!subject || !subject.modules) return;
    subject.modules.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      if (m.id === selectedModuleId) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function openAddTopicModal(targetModuleId) {
    const subject = getActiveSubject();
    if (!subject || !subject.modules || subject.modules.length === 0) {
      alert('Please add a module first.');
      return;
    }

    const modId = targetModuleId || subject.modules[0].id;
    populateTopicModuleSelect(modId);

    document.getElementById('modal-topic-title').textContent = 'Add Topic';
    document.getElementById('input-topic-id').value = '';
    document.getElementById('input-topic-module-id').value = modId;
    document.getElementById('input-topic-name').value = '';
    document.getElementById('input-topic-priority').value = 'medium';
    document.getElementById('input-topic-status').value = 'not-started';
    document.getElementById('input-topic-est-hours').value = '2';
    document.getElementById('input-topic-desc').value = '';

    openModal('modal-topic');
  }

  document.getElementById('form-topic').addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = getActiveSubject();
    if (!subject) return;

    const targetModuleId = document.getElementById('input-topic-module-select').value;
    const name = document.getElementById('input-topic-name').value.trim();
    const priority = document.getElementById('input-topic-priority').value;
    const status = document.getElementById('input-topic-status').value;
    const estHours = parseFloat(document.getElementById('input-topic-est-hours').value) || 1;
    const desc = document.getElementById('input-topic-desc').value.trim();

    if (!name) return;

    const targetMod = subject.modules.find(m => m.id === targetModuleId);
    if (targetMod) {
      targetMod.topics.push({
        id: 'top_' + Date.now(),
        name,
        description: desc,
        priority,
        status,
        estHours,
        confidence: 0,
        revisions: { r1: status === 'completed', r2: false, r3: false },
        notes: '',
        resources: '',
        timeSpentMinutes: 0
      });
      addXP(50, 'Created Topic');
      showToast('Topic added to syllabus');
    }

    saveState();
    closeModal('modal-topic');
    renderStats();
    renderModulesAndTopics();
    populateTimerTopics();
  });

  // --- 2. MODULE MODAL ---
  function openAddModuleModal() {
    const subject = getActiveSubject();
    if (!subject) {
      alert('Please create a course first.');
      return;
    }

    document.getElementById('modal-module-title').textContent = 'Add Module';
    document.getElementById('input-module-id').value = '';
    document.getElementById('input-module-name').value = `Module ${(subject.modules?.length || 0) + 1}: `;
    document.getElementById('input-module-weight').value = '25%';
    document.getElementById('input-module-order').value = (subject.modules?.length || 0) + 1;
    document.getElementById('input-module-desc').value = '';
    openModal('modal-module');
  }

  document.getElementById('form-module').addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = getActiveSubject();
    if (!subject) return;

    const name = document.getElementById('input-module-name').value.trim();
    const weight = document.getElementById('input-module-weight').value.trim();
    const order = parseInt(document.getElementById('input-module-order').value, 10) || 1;
    const desc = document.getElementById('input-module-desc').value.trim();

    if (!name) return;
    if (!subject.modules) subject.modules = [];

    subject.modules.push({
      id: 'mod_' + Date.now(),
      name,
      weight,
      order,
      description: desc,
      topics: []
    });

    subject.modules.sort((a, b) => (a.order || 0) - (b.order || 0));

    saveState();
    closeModal('modal-module');
    renderStats();
    renderModulesAndTopics();
    showToast('Module created');
  });

  // --- 3. COURSE / SUBJECT MODAL (With Date of Exam) ---
  function openAddSubjectModal(existingSubject = null) {
    if (existingSubject) {
      document.getElementById('modal-subject-title').textContent = 'Edit Course & Exam Date';
      document.getElementById('input-subject-id').value = existingSubject.id;
      document.getElementById('input-subject-name').value = existingSubject.name || '';
      document.getElementById('input-subject-code').value = existingSubject.code || '';
      document.getElementById('input-subject-exam-date').value = existingSubject.examDate || '';
      document.getElementById('input-subject-desc').value = existingSubject.description || '';
      document.getElementById('btn-delete-subject').classList.remove('hidden');
    } else {
      document.getElementById('modal-subject-title').textContent = 'Add Course & Exam Date';
      document.getElementById('input-subject-id').value = '';
      document.getElementById('input-subject-name').value = '';
      document.getElementById('input-subject-code').value = '';
      document.getElementById('input-subject-exam-date').value = getFutureDate(30);
      document.getElementById('input-subject-desc').value = '';
      document.getElementById('btn-delete-subject').classList.add('hidden');
    }
    openModal('modal-subject');
  }

  const btnHeroExamPill = document.getElementById('btn-hero-exam-pill');
  if (btnHeroExamPill) {
    btnHeroExamPill.addEventListener('click', () => {
      const subject = getActiveSubject();
      if (subject) openAddSubjectModal(subject);
      else openAddSubjectModal();
    });
  }

  const btnAnalyticsEditExam = document.getElementById('btn-analytics-edit-exam');
  if (btnAnalyticsEditExam) {
    btnAnalyticsEditExam.addEventListener('click', () => {
      const subject = getActiveSubject();
      if (subject) openAddSubjectModal(subject);
      else openAddSubjectModal();
    });
  }

  document.getElementById('form-subject').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('input-subject-id').value;
    const name = document.getElementById('input-subject-name').value.trim();
    const code = document.getElementById('input-subject-code').value.trim();
    const examDate = document.getElementById('input-subject-exam-date').value;
    const desc = document.getElementById('input-subject-desc').value.trim();

    if (!name) return;

    if (id) {
      const existing = appState.subjects.find(s => s.id === id);
      if (existing) {
        existing.name = name;
        existing.code = code;
        existing.examDate = examDate;
        existing.description = desc;
        showToast('Exam date & course updated! 🎯');
      }
    } else {
      const newSub = {
        id: 'sub_' + Date.now(),
        code: code || 'COURSE',
        name: name,
        category: 'General',
        examDate: examDate,
        description: desc,
        modules: []
      };
      if (!appState.subjects) appState.subjects = [];
      appState.subjects.push(newSub);
      appState.activeSubjectId = newSub.id;
      showToast('New course created with exam countdown!');
    }

    saveState();
    closeModal('modal-subject');
    renderSubjectSelector();
    renderHeroBanner();
    renderStats();
    renderModulesAndTopics();
  });

  document.getElementById('btn-delete-subject').addEventListener('click', () => {
    const id = document.getElementById('input-subject-id').value;
    if (!id) return;
    if (confirm('Delete this course and its syllabus?')) {
      appState.subjects = appState.subjects.filter(s => s.id !== id);
      appState.activeSubjectId = appState.subjects[0]?.id || null;
      saveState();
      closeModal('modal-subject');
      renderSubjectSelector();
      renderHeroBanner();
      renderStats();
      renderModulesAndTopics();
      showToast('Course deleted');
    }
  });

  // --- 4. NOTES MODAL ---
  function openNotesModal(topicId) {
    const res = findTopicAndModule(topicId);
    if (!res) return;

    document.getElementById('notes-topic-id').value = res.topic.id;
    document.getElementById('notes-module-badge').textContent = res.module.name.split(':')[0];
    document.getElementById('notes-topic-title').textContent = res.topic.name;
    document.getElementById('notes-content').value = res.topic.notes || '';
    document.getElementById('notes-resources').value = res.topic.resources || '';

    const btnFocus = document.getElementById('btn-start-focus-from-notes');
    btnFocus.onclick = () => {
      closeModal('modal-notes');
      startPomodoroForTopic(res.topic.id, res.topic.name);
    };

    openModal('modal-notes');
  }

  document.getElementById('btn-save-notes').addEventListener('click', () => {
    const topicId = document.getElementById('notes-topic-id').value;
    const res = findTopicAndModule(topicId);
    if (res) {
      res.topic.notes = document.getElementById('notes-content').value;
      res.topic.resources = document.getElementById('notes-resources').value;
      saveState();
      renderModulesAndTopics();
      closeModal('modal-notes');
      addXP(15, 'Saved Notes');
    }
  });

  // --- 5. SMART TEXT IMPORTER ---
  document.getElementById('btn-load-sample-syllabus').addEventListener('click', () => {
    const sample = `Module 1: Fourier Transforms
- Fourier Integral
- From Fourier Series to Fourier Integral
- Fourier Cosine and Sine Integrals
- Fourier Cosine and Sine Transform
- Linearity
- Transforms of Derivatives
- Fourier Transform and its Inverse

Module 2: Complex Functions and Conformal Mapping
- Complex Functions
- Limit and Continuity
- Analytic Functions
- Cauchy-Riemann Equations`;
    document.getElementById('quick-import-textarea').value = sample;
  });

  document.getElementById('btn-execute-import').addEventListener('click', () => {
    const text = document.getElementById('quick-import-textarea').value.trim();
    if (!text) return;

    const appendMode = document.getElementById('import-append-mode').checked;
    let subject = getActiveSubject();

    if (!subject) {
      subject = {
        id: 'sub_' + Date.now(),
        code: 'COURSE',
        name: 'My Course Syllabus',
        category: 'General',
        examDate: getFutureDate(30),
        description: 'Imported syllabus outline.',
        modules: []
      };
      appState.subjects = [subject];
      appState.activeSubjectId = subject.id;
    }

    const lines = text.split('\n');
    const parsedModules = [];
    let currentMod = null;
    let orderCounter = 1;

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const isModuleHeader = /^(module|unit|chapter|section|part)\b/i.test(line) ||
                             /^(\d+\.|\b[A-Z\s]{4,}:)/.test(line) && !line.startsWith('-');

      if (isModuleHeader) {
        currentMod = {
          id: 'mod_' + Date.now() + '_' + orderCounter,
          name: line,
          weight: '25%',
          order: orderCounter++,
          description: '',
          topics: []
        };
        parsedModules.push(currentMod);
      } else {
        let cleanTopicName = line.replace(/^[\*\-\•\–\—\d\.\)\s]+/, '').trim();
        if (!cleanTopicName) continue;

        if (!currentMod) {
          currentMod = {
            id: 'mod_' + Date.now() + '_' + orderCounter,
            name: `Module ${orderCounter}: Core Concepts`,
            weight: '100%',
            order: orderCounter++,
            description: '',
            topics: []
          };
          parsedModules.push(currentMod);
        }

        currentMod.topics.push({
          id: 'top_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: cleanTopicName,
          description: '',
          priority: 'medium',
          status: 'not-started',
          estHours: 2,
          confidence: 0,
          revisions: { r1: false, r2: false, r3: false },
          notes: '',
          resources: '',
          timeSpentMinutes: 0
        });
      }
    }

    if (parsedModules.length === 0) return;

    if (appendMode && subject.modules) {
      subject.modules.push(...parsedModules);
    } else {
      subject.modules = parsedModules;
    }

    saveState();
    closeModal('modal-quick-import');
    renderSubjectSelector();
    renderHeroBanner();
    renderStats();
    renderModulesAndTopics();
    populateTimerTopics();
    triggerCelebration();
    addXP(100, 'Imported Syllabus');
  });

  // --- 6. WORKING AUTHENTICATION (DUAL LOCAL & CLOUD) ---
  const btnOpenLogin = document.getElementById('btn-open-login');
  if (btnOpenLogin) btnOpenLogin.addEventListener('click', () => openModal('modal-auth'));

  const tabLogin = document.getElementById('tab-btn-login');
  const tabSignup = document.getElementById('tab-btn-signup');
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');

  tabLogin.addEventListener('click', () => {
    tabLogin.className = 'flex-1 py-2 text-indigo-600 border-b-2 border-indigo-600';
    tabSignup.className = 'flex-1 py-2 text-slate-400 border-b-2 border-transparent';
    formLogin.classList.remove('hidden');
    formSignup.classList.add('hidden');
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.className = 'flex-1 py-2 text-indigo-600 border-b-2 border-indigo-600';
    tabLogin.className = 'flex-1 py-2 text-slate-400 border-b-2 border-transparent';
    formSignup.classList.remove('hidden');
    formLogin.classList.add('hidden');
  });

  // Handle Login
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('input-login-email').value.trim();
    const password = document.getElementById('input-login-password').value;

    if (firebaseDb) {
      try {
        const studentKey = sanitizeFirebaseKey(email);
        const snapshot = await firebaseDb.ref('students/' + studentKey).once('value');
        const prof = snapshot.val();
        if (prof) {
          currentUser = {
            id: prof.userId || generateUUID(),
            email: prof.email || email.toLowerCase().trim(),
            name: prof.displayName || email.split('@')[0],
            isCloud: true
          };
          saveCurrentUser(currentUser);
          closeModal('modal-auth');
          showToast(`Welcome back, ${currentUser.name}! ☁️`);
          loadStudentCloudData();
          return;
        }
      } catch (errFb) {
        console.warn('Firebase login note:', errFb);
      }
    }

    // Local Accounts
    const localAccounts = getLocalAccounts();
    const found = localAccounts.find(a => a.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      const newAcc = {
        id: generateUUID(),
        email: email,
        name: email.split('@')[0],
        password: password,
        createdAt: new Date().toISOString()
      };
      localAccounts.push(newAcc);
      saveLocalAccounts(localAccounts);
      currentUser = { id: newAcc.id, email: newAcc.email, name: newAcc.name, isCloud: true };
      saveCurrentUser(currentUser);
      closeModal('modal-auth');
      addXP(50, 'Student Signed In');
      showToast(`Welcome, ${currentUser.name}! Account ready.`);
      syncToCloudNow();
      return;
    }

    if (found.password !== password) {
      alert('Incorrect password. Please try again.');
      return;
    }

    currentUser = { id: found.id, email: found.email, name: found.name, isCloud: true };
    saveCurrentUser(currentUser);
    closeModal('modal-auth');
    addXP(30, 'Student Signed In');
    showToast(`Welcome back, ${currentUser.name}! 👋`);
    loadStudentCloudData();
    syncToCloudNow();
  });

  // Handle Signup
  formSignup.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('input-signup-name').value.trim();
    const email = document.getElementById('input-signup-email').value.trim();
    const password = document.getElementById('input-signup-password').value;
    if (!name || !email || !password) return;

    const localAccounts = getLocalAccounts();
    const existing = localAccounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.password = password;
      existing.name = name;
    } else {
      localAccounts.push({
        id: generateUUID(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
      });
    }
    saveLocalAccounts(localAccounts);

    currentUser = { id: generateUUID(), name, email, isCloud: true };
    saveCurrentUser(currentUser);
    closeModal('modal-auth');
    addXP(100, 'Student Registration');
    showToast(`Account created for ${name}! 🎓`);
    syncToCloudNow();
  });

  const btnSignOut = document.getElementById('btn-signout');
  if (btnSignOut) {
    btnSignOut.addEventListener('click', () => {
      saveCurrentUser(null);
      showToast('Signed out (Login gate active)');
    });
  }

  // --- FIRST-SCREEN ONBOARDING & LOGIN GATE HANDLERS ---
  function initGateAuthHandlers() {
    const tabLogin = document.getElementById('gate-tab-login');
    const tabSignup = document.getElementById('gate-tab-signup');
    const formLogin = document.getElementById('gate-form-login');
    const formSignup = document.getElementById('gate-form-signup');
    const btnGuest = document.getElementById('btn-gate-guest');

    if (tabLogin && tabSignup && formLogin && formSignup) {
      tabLogin.addEventListener('click', () => {
        tabLogin.className = 'flex-1 py-2.5 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 text-center transition font-bold';
        tabSignup.className = 'flex-1 py-2.5 text-slate-400 border-b-2 border-transparent text-center transition hover:text-slate-600 dark:hover:text-slate-200 font-bold';
        formLogin.classList.remove('hidden');
        formSignup.classList.add('hidden');
      });

      tabSignup.addEventListener('click', () => {
        tabSignup.className = 'flex-1 py-2.5 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 text-center transition font-bold';
        tabLogin.className = 'flex-1 py-2.5 text-slate-400 border-b-2 border-transparent text-center transition hover:text-slate-600 dark:hover:text-slate-200 font-bold';
        formSignup.classList.remove('hidden');
        formLogin.classList.add('hidden');
      });
    }

    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('gate-login-email')?.value.trim();
        const password = document.getElementById('gate-login-password')?.value;
        if (!email || !password) return;

        if (firebaseDb) {
          try {
            showToast('Connecting to Nerve Cloud...');
            const studentKey = sanitizeFirebaseKey(email);
            const snapshot = await firebaseDb.ref('students/' + studentKey).once('value');
            const prof = snapshot.val();
            if (prof) {
              currentUser = {
                id: prof.userId || generateUUID(),
                email: prof.email || email.toLowerCase().trim(),
                name: prof.displayName || email.split('@')[0],
                isCloud: true
              };
              saveCurrentUser(currentUser);
              showToast(`Welcome back, ${currentUser.name}! ☁️`);
              loadStudentCloudData();
              return;
            }
          } catch (errFb) {
            console.warn('Firebase signin note:', errFb);
          }
        }

        const localAccounts = getLocalAccounts();
        const found = localAccounts.find(a => a.email.toLowerCase() === email.toLowerCase());

        if (!found) {
          const newAcc = {
            id: generateUUID(),
            email: email,
            name: email.split('@')[0],
            password: password,
            createdAt: new Date().toISOString()
          };
          localAccounts.push(newAcc);
          saveLocalAccounts(localAccounts);
          currentUser = { id: newAcc.id, email: newAcc.email, name: newAcc.name, isCloud: true };
          saveCurrentUser(currentUser);
          addXP(50, 'Student Signed In');
          showToast(`Welcome, ${currentUser.name}! Account ready.`);
          loadStudentCloudData();
          syncToCloudNow();
          return;
        }

        if (found.password !== password) {
          alert('Incorrect password. Please try again.');
          return;
        }

        currentUser = { id: found.id, email: found.email, name: found.name, isCloud: true };
        saveCurrentUser(currentUser);
        addXP(30, 'Student Signed In');
        showToast(`Welcome back, ${currentUser.name}! 👋`);
        loadStudentCloudData();
        syncToCloudNow();
      });
    }

    if (formSignup) {
      formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('gate-signup-name')?.value.trim();
        const email = document.getElementById('gate-signup-email')?.value.trim();
        const password = document.getElementById('gate-signup-password')?.value;
        if (!name || !email || !password) return;

        const localAccounts = getLocalAccounts();
        const existing = localAccounts.find(a => a.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          existing.password = password;
          existing.name = name;
        } else {
          localAccounts.push({
            id: generateUUID(),
            name,
            email,
            password,
            createdAt: new Date().toISOString()
          });
        }
        saveLocalAccounts(localAccounts);

        currentUser = {
          id: generateUUID(),
          email: email.toLowerCase().trim(),
          name: name,
          isCloud: true
        };
        saveCurrentUser(currentUser);
        showToast(`Account created for ${name}! 🎓`);
        syncToCloudNow();

        currentUser = { id: generateUUID(), name, email, isCloud: false };
        saveCurrentUser(currentUser);
        addXP(100, 'Student Registration');
        showToast(`Account created for ${name}! 🎓`);
      });
    }

    if (btnGuest) {
      btnGuest.addEventListener('click', () => {
        currentUser = {
          id: 'guest_' + Date.now(),
          name: 'Guest Scholar',
          email: 'guest@nerve.local',
          isCloud: false,
          isGuest: true
        };
        saveCurrentUser(currentUser);
        showToast('Continuing as Guest Scholar (Offline Mode)');
      });
    }
  }

  const btnProfileSync = document.getElementById('btn-profile-sync');
  if (btnProfileSync) {
    btnProfileSync.addEventListener('click', () => loadStudentCloudData());
  }

  const btnManualSync = document.getElementById('btn-manual-sync');
  if (btnManualSync) {
    btnManualSync.addEventListener('click', () => loadStudentCloudData());
  }

  // --- 1. RESET STUDY PROGRESS (EMPTY PROGRESS TO 0%) ---
  const btnResetProgress = document.getElementById('btn-reset-empty-syllabus');
  if (btnResetProgress) {
    btnResetProgress.addEventListener('click', () => {
      if (confirm('Reset study progress to 0%? Your syllabus courses and modules will remain safe, only topic checkmarks, confidence ratings, and revisions will be reset to start fresh.')) {
        if (appState.subjects) {
          appState.subjects.forEach(sub => {
            (sub.modules || []).forEach(mod => {
              (mod.topics || []).forEach(top => {
                top.status = 'not-started';
                top.completed = false;
                top.confidence = 0;
                top.revisions = { r1: false, r2: false, r3: false };
              });
            });
          });
        }
        if (appState.gamification) {
          appState.gamification.completed_topics = 0;
          appState.gamification.completion_pct = 0;
        }
        saveState();
        renderHeroBanner();
        renderStats();
        renderModulesAndTopics();
        populateTimerTopics();
        renderGamificationUI();
        renderLeaderboard();
        showToast('Study progress reset to 0% (Syllabus intact) 🔄');
      }
    });
  }

  // --- 2. LOAD SEMESTER 3 SYLLABUS (8 ENGINEERING COURSES) ---
  function loadSemester3Syllabus() {
    if (confirm('Load official Semester 3 Syllabus (8 Courses, 315+ topics)? This will load all standard B.Tech courses with modules, topics, and exam schedules.')) {
      appState.subjects = JSON.parse(JSON.stringify(DEFAULT_DATA.subjects));
      appState.activeSubjectId = appState.subjects[0]?.id || 'sub_gymat301';
      saveState();
      renderSubjectSelector();
      renderHeroBanner();
      renderStats();
      renderModulesAndTopics();
      populateTimerTopics();
      renderGamificationUI();
      renderLeaderboard();
      triggerCelebration();
      showToast('🎉 Semester 3 Syllabus loaded (8 Courses & 315+ topics)!');
    }
  }

  const btnResetSamples = document.getElementById('btn-reset-all-data');
  if (btnResetSamples) {
    btnResetSamples.addEventListener('click', loadSemester3Syllabus);
  }

  const btnSheetLoadSem3 = document.getElementById('btn-sheet-load-sem3');
  if (btnSheetLoadSem3) {
    btnSheetLoadSem3.addEventListener('click', () => {
      closeModal('modal-quick-actions');
      loadSemester3Syllabus();
    });
  }

  // --- 3. DELETE COURSE HANDLERS ---
  const btnHeroDeleteCourse = document.getElementById('btn-hero-delete-course');
  if (btnHeroDeleteCourse) {
    btnHeroDeleteCourse.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteCurrentCourse();
    });
  }

  const btnProfileDeleteCourse = document.getElementById('btn-delete-active-course');
  if (btnProfileDeleteCourse) {
    btnProfileDeleteCourse.addEventListener('click', () => deleteCurrentCourse());
  }

  const btnSheetDeleteCourse = document.getElementById('btn-sheet-delete-course');
  if (btnSheetDeleteCourse) {
    btnSheetDeleteCourse.addEventListener('click', () => {
      closeModal('modal-quick-actions');
      deleteCurrentCourse();
    });
  }

  const btnExportJson = document.getElementById('btn-export-json');
  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `nerve_sem3_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Backup JSON downloaded');
    });
  }

  const inputImportFile = document.getElementById('input-import-file');
  if (inputImportFile) {
    inputImportFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.subjects && Array.isArray(imported.subjects)) {
            appState = imported;
            saveState();
            renderSubjectSelector();
            renderHeroBanner();
            renderStats();
            renderModulesAndTopics();
            populateTimerTopics();
            initGamification();
            showToast('Data restored!');
          }
        } catch (err) {
          alert('Invalid backup file');
        }
      };
      reader.readAsText(file);
    });
  }

  // --- AI COURSE MODULE SYLLABUS GENERATOR ENGINE ---
  let aiImportMode = 'new'; // 'new' or 'append'
  let parsedAIData = null;

  function aiParseSyllabus(rawText) {
    if (!rawText || !rawText.trim()) return null;
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    let courseName = '';
    let courseCode = '';
    const modules = [];
    let currentModule = null;

    const codeRegex = /(?:Course\s*Code\s*[:=\-]\s*|code\s*[:=\-]\s*)([A-Za-z0-9_\-]+)/i;
    const standaloneCodeRegex = /\b([A-Z]{2,6}\s*\d{3,4}[A-Za-z]?)\b/;
    const moduleRegex = /^(?:Module|Unit|Chapter|Part|Section)\s*([\dIVXLCDM]+)?[\s:\-–—]*(.*)/i;
    const topicNumberRegex = /^(?:(\d+|[a-zA-Z]|[ivxIVX]+)[\.\)\-–—]\s*)(.+)$/;
    const bulletRegex = /^[\*\-\•\–—]\s*(.+)$/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for course code explicitly
      const codeMatch = line.match(codeRegex);
      if (codeMatch && !courseCode) {
        courseCode = codeMatch[1].trim().toUpperCase();
        continue;
      }

      // Check for Module header
      const modMatch = line.match(moduleRegex);
      if (modMatch) {
        const modNum = modMatch[1] || `${modules.length + 1}`;
        const modTitle = modMatch[2]?.trim() || `Module ${modNum}`;
        currentModule = {
          id: 'mod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: `Module ${modNum}: ${modTitle}`,
          weight: '25%',
          topics: []
        };
        modules.push(currentModule);
        continue;
      }

      // Check for Topic inside current module
      if (currentModule) {
        let topicTitle = '';
        const numMatch = line.match(topicNumberRegex);
        const bulletMatch = line.match(bulletRegex);

        if (numMatch) {
          topicTitle = numMatch[2].trim();
        } else if (bulletMatch) {
          topicTitle = bulletMatch[1].trim();
        } else if (line.length > 2 && !line.toLowerCase().startsWith('course') && !line.toLowerCase().startsWith('semester')) {
          topicTitle = line;
        }

        if (topicTitle) {
          const lower = topicTitle.toLowerCase();
          let priority = 'medium';
          let estHours = 2.0;

          if (lower.match(/theorem|transform|analysis|design|algorithm|calculus|equation|differential|matrix|fourier|laplace|state machine|s-domain|resonant/)) {
            priority = 'high';
            estHours = 2.5;
          } else if (lower.match(/intro|basic|definition|concept|overview|review|history|application|role of/)) {
            priority = 'low';
            estHours = 1.5;
          }

          currentModule.topics.push({
            id: 'top_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: topicTitle,
            status: 'not_started',
            completed: false,
            priority: priority,
            notes: '',
            estimatedHours: estHours
          });
          continue;
        }
      }

      // If we haven't found a course name yet
      if (!courseName && !line.toLowerCase().startsWith('semester') && !line.toLowerCase().startsWith('course code') && !line.match(moduleRegex)) {
        const cleaned = line.replace(/^\d+[\.\)\-–—]\s*/, '').trim();
        if (cleaned.length > 3) {
          courseName = cleaned;
        }
      }
      if (!courseCode) {
        const standaloneMatch = line.match(standaloneCodeRegex);
        if (standaloneMatch) {
          courseCode = standaloneMatch[1].replace(/\s+/g, '').toUpperCase();
        }
      }
    }

    if (!courseName) {
      courseName = 'Custom Engineering Course';
    }
    if (!courseCode) {
      courseCode = 'ENG' + Math.floor(100 + Math.random() * 900);
    }

    // Fallback if topics were found with no module headers
    if (modules.length === 0 && lines.length > 0) {
      const singleMod = {
        id: 'mod_' + Date.now() + '_1',
        name: 'Module 1: Core Topics',
        weight: '100%',
        topics: []
      };
      lines.forEach(l => {
        const cleaned = l.replace(/^\d+[\.\)\-–—]\s*/, '').replace(/^[\*\-\•]\s*/, '').trim();
        if (cleaned.length > 2 && !cleaned.toLowerCase().includes('course code')) {
          singleMod.topics.push({
            id: 'top_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: cleaned,
            status: 'not_started',
            completed: false,
            priority: 'medium',
            notes: '',
            estimatedHours: 2.0
          });
        }
      });
      if (singleMod.topics.length > 0) {
        modules.push(singleMod);
      }
    }

    return {
      name: courseName,
      code: courseCode,
      modules: modules
    };
  }

  function initAISyllabusGenerator() {
    const btnOpenHeader = document.getElementById('btn-open-ai-syllabus');
    if (btnOpenHeader) {
      btnOpenHeader.addEventListener('click', () => openModal('modal-ai-syllabus'));
    }

    const btnOpenSheet = document.getElementById('btn-sheet-ai-syllabus');
    if (btnOpenSheet) {
      btnOpenSheet.addEventListener('click', () => {
        closeModal('modal-quick-actions');
        openModal('modal-ai-syllabus');
      });
    }

    const btnModeNew = document.getElementById('ai-mode-new-course');
    const btnModeAppend = document.getElementById('ai-mode-append');
    const courseFieldsWrapper = document.getElementById('ai-course-fields-wrapper');
    const confirmBtnText = document.getElementById('ai-confirm-btn-text');

    if (btnModeNew && btnModeAppend) {
      btnModeNew.addEventListener('click', () => {
        aiImportMode = 'new';
        btnModeNew.className = 'flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs text-center transition font-bold';
        btnModeAppend.className = 'flex-1 py-1.5 rounded-lg text-slate-400 text-center transition hover:text-slate-600 dark:hover:text-slate-200 font-bold';
        if (courseFieldsWrapper) courseFieldsWrapper.classList.remove('hidden');
        if (confirmBtnText) confirmBtnText.textContent = 'Confirm & Add New Course';
      });

      btnModeAppend.addEventListener('click', () => {
        aiImportMode = 'append';
        btnModeAppend.className = 'flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs text-center transition font-bold';
        btnModeNew.className = 'flex-1 py-1.5 rounded-lg text-slate-400 text-center transition hover:text-slate-600 dark:hover:text-slate-200 font-bold';
        if (courseFieldsWrapper) courseFieldsWrapper.classList.add('hidden');
        const activeSub = getActiveSubject();
        if (confirmBtnText) confirmBtnText.textContent = `Append Modules to ${activeSub ? activeSub.code || activeSub.name : 'Current Course'}`;
      });
    }

    const btnLoadSample = document.getElementById('btn-ai-load-sample');
    const textarea = document.getElementById('ai-syllabus-textarea');
    if (btnLoadSample && textarea) {
      btnLoadSample.addEventListener('click', () => {
        textarea.value = `CONTROL SYSTEMS ENGINEERING
Course Code: PECET306

Module 1: System Modeling and Transfer Functions
1. Open Loop and Closed Loop Feedback Systems
2. Transfer Function of Linear Time-Invariant Systems
3. Block Diagram Reduction Techniques
4. Signal Flow Graphs and Mason's Gain Formula
5. Modeling of Electrical and Mechanical Systems

Module 2: Time Response Analysis
1. Standard Test Signals (Step, Ramp, Impulse)
2. Transient Response of First-Order Systems
3. Transient Response of Second-Order Systems
4. Time Domain Specifications (Rise time, Peak time, Settling time)
5. Steady State Error and Error Constants

Module 3: Stability and Frequency Response
1. Concept of Stability and Routh-Hurwitz Criterion
2. Root Locus Technique and Construction Rules
3. Frequency Response Specifications
4. Bode Plots (Magnitude and Phase Plots)
5. Polar Plots and Nyquist Stability Criterion`;
        showToast('Sample syllabus text inserted! ✨');
      });
    }

    const btnParse = document.getElementById('btn-ai-parse-text');
    const previewSection = document.getElementById('ai-preview-section');
    const inputName = document.getElementById('ai-input-course-name');
    const inputCode = document.getElementById('ai-input-course-code');
    const statsBadge = document.getElementById('ai-preview-stats-badge');
    const previewTree = document.getElementById('ai-preview-modules-tree');

    if (btnParse && textarea) {
      btnParse.addEventListener('click', () => {
        const text = textarea.value.trim();
        if (!text) {
          alert('Please paste some syllabus text first!');
          return;
        }

        parsedAIData = aiParseSyllabus(text);
        if (!parsedAIData || parsedAIData.modules.length === 0) {
          alert('Could not detect modules or topics. Please check the text format.');
          return;
        }

        if (inputName) inputName.value = parsedAIData.name;
        if (inputCode) inputCode.value = parsedAIData.code;

        let totalTopics = 0;
        parsedAIData.modules.forEach(m => totalTopics += m.topics.length);

        if (statsBadge) {
          statsBadge.textContent = `${parsedAIData.modules.length} Modules • ${totalTopics} Topics Detected`;
        }

        if (previewTree) {
          previewTree.innerHTML = parsedAIData.modules.map(m => `
            <div class="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-xs">
                <span>${escapeHtml(m.name)}</span>
                <span class="text-[10px] text-indigo-500 font-extrabold">${m.topics.length} topics</span>
              </div>
              <ul class="mt-1 space-y-0.5 pl-3 border-l-2 border-indigo-200 dark:border-indigo-800 text-[11px] text-slate-600 dark:text-slate-300">
                ${m.topics.slice(0, 4).map(t => `<li class="truncate">• ${escapeHtml(t.name)}</li>`).join('')}
                ${m.topics.length > 4 ? `<li class="text-[10px] text-slate-400 italic">+ ${m.topics.length - 4} more topics</li>` : ''}
              </ul>
            </div>
          `).join('');
        }

        if (previewSection) {
          previewSection.classList.remove('hidden');
          previewSection.scrollIntoView({ behavior: 'smooth' });
        }

        showToast(`AI successfully structured ${parsedAIData.modules.length} modules! 🧠`);
      });
    }

    const btnConfirmSave = document.getElementById('btn-ai-confirm-save');
    if (btnConfirmSave) {
      btnConfirmSave.addEventListener('click', () => {
        if (!parsedAIData || parsedAIData.modules.length === 0) {
          alert('Please parse syllabus text first!');
          return;
        }

        if (inputName && inputName.value.trim()) {
          parsedAIData.name = inputName.value.trim();
        }
        if (inputCode && inputCode.value.trim()) {
          parsedAIData.code = inputCode.value.trim().toUpperCase();
        }

        let totalTopics = 0;
        parsedAIData.modules.forEach(m => totalTopics += m.topics.length);

        if (aiImportMode === 'new') {
          const subId = 'sub_' + (parsedAIData.code.toLowerCase().replace(/[^a-z0-9]/g, '') || Date.now());
          const newCourse = {
            id: subId,
            code: parsedAIData.code,
            name: parsedAIData.name,
            category: 'Core Engineering',
            examDate: '',
            modules: parsedAIData.modules
          };
          appState.subjects.push(newCourse);
          appState.activeSubjectId = newCourse.id;
        } else {
          const targetSub = getActiveSubject();
          if (!targetSub) {
            alert('No active course selected to append to.');
            return;
          }
          if (!targetSub.modules) targetSub.modules = [];
          targetSub.modules.push(...parsedAIData.modules);
        }

        saveState();
        renderSubjectSelector();
        renderHeroBanner();
        renderStats();
        renderModulesAndTopics();
        populateTimerTopics();
        renderLeaderboard();
        closeModal('modal-ai-syllabus');
        triggerCelebration();
        addXP(150, 'AI Syllabus Created');
        showToast(`🎉 "${parsedAIData.name}" ready with ${totalTopics} topics!`);
      });
    }
  }

  // --- 1-TAP CROSS-DEVICE SYNC CODE ---
  function generateSyncCode() {
    try {
      const payload = {
        v: 3,
        time: Date.now(),
        user: currentUser,
        subjects: appState.subjects,
        gamification: appState.gamification,
        activeSubjectId: appState.activeSubjectId
      };
      return btoa(encodeURIComponent(JSON.stringify(payload)));
    } catch (e) {
      console.error('Error generating sync code:', e);
      return null;
    }
  }

  function applySyncCode(token) {
    if (!token || !token.trim()) {
      showToast('Please paste a sync code');
      return false;
    }
    try {
      const jsonStr = decodeURIComponent(atob(token.trim()));
      const data = JSON.parse(jsonStr);
      if (data && Array.isArray(data.subjects)) {
        appState.subjects = data.subjects;
        if (data.gamification) appState.gamification = data.gamification;
        if (data.activeSubjectId) appState.activeSubjectId = data.activeSubjectId;
        if (data.user) saveCurrentUser(data.user);
        saveState();
        renderSubjectSelector();
        renderHeroBanner();
        renderStats();
        renderModulesAndTopics();
        populateTimerTopics();
        renderGamificationUI();
        renderLeaderboard();
        showToast('All progress synced from other device! 🚀');
        return true;
      } else {
        throw new Error('Invalid schema');
      }
    } catch (err) {
      alert('Invalid or corrupted sync code. Please copy fresh code from your other device.');
      return false;
    }
  }

  function initSyncCodeHandlers() {
    const btnExport = document.getElementById('btn-export-sync-code');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const token = generateSyncCode();
        if (!token) {
          showToast('Failed to create sync code');
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(token).then(() => {
            showToast('📱 1-Tap Sync Code copied! Paste on other device.');
          }).catch(() => {
            prompt('Copy your sync code:', token);
          });
        } else {
          prompt('Copy your sync code:', token);
        }
      });
    }

    const btnOpenImport = document.getElementById('btn-open-import-sync');
    if (btnOpenImport) {
      btnOpenImport.addEventListener('click', () => {
        const input = document.getElementById('input-sync-token');
        if (input) input.value = '';
        openModal('modal-sync-token');
      });
    }

    const btnApply = document.getElementById('btn-apply-sync-token');
    if (btnApply) {
      btnApply.addEventListener('click', () => {
        const token = document.getElementById('input-sync-token')?.value;
        if (applySyncCode(token)) {
          closeModal('modal-sync-token');
        }
      });
    }
  }

  // --- REAL-TIME CLASS LEADERBOARD (NO DEMO DATA) ---
  let currentLeaderboardSort = 'portion'; // 'portion', 'xp', 'streak'

  async function fetchLeaderboardProfiles() {
    const realStudents = [];

    // 1. Primary: Fetch all student profiles from Firebase Realtime Database
    if (firebaseDb) {
      try {
        const snapshot = await firebaseDb.ref('students').once('value');
        const studentsMap = snapshot.val();
        if (studentsMap && typeof studentsMap === 'object') {
          const fbStudents = Object.values(studentsMap).map(s => ({
            id: s.userId || s.email,
            display_name: s.displayName || s.email?.split('@')[0] || 'Student',
            level: s.level || 1,
            xp: s.xp || 0,
            streak: s.streak || 1,
            completed_topics: s.completedTopics || 0,
            total_topics: s.totalTopics || 315,
            completion_pct: s.completionPct || 0
          }));
          if (fbStudents.length > 0) {
            return fbStudents;
          }
        }
      } catch (errFb) {
        console.warn('Firebase leaderboard fetch note:', errFb);
      }
    }

    // Include other real registered student accounts if present locally
    const localAccs = getLocalAccounts();
    localAccs.forEach(acc => {
      if (acc.id && acc.email && (!currentUser || acc.id !== currentUser.id)) {
        realStudents.push({
          id: acc.id,
          display_name: acc.name || acc.email.split('@')[0],
          level: 1,
          xp: 0,
          streak: 1,
          completed_topics: 0,
          total_topics: 315,
          completion_pct: 0
        });
      }
    });

    return realStudents;
  }

  async function renderLeaderboard(isManualRefresh = false) {
    const podiumContainer = document.getElementById('podium-container');
    const rosterList = document.getElementById('leaderboard-roster-list');
    const totalCountBadge = document.getElementById('leaderboard-total-count');
    const myRankBadge = document.getElementById('my-rank-badge');
    const myRankName = document.getElementById('my-rank-name');
    const myRankCoverage = document.getElementById('my-rank-coverage');
    const myRankProgressBar = document.getElementById('my-rank-progress-bar');
    const myRankNudge = document.getElementById('my-rank-nudge');

    if (!podiumContainer || !rosterList) return;

    if (isManualRefresh) {
      const refreshBtn = document.getElementById('btn-refresh-leaderboard');
      if (refreshBtn) refreshBtn.classList.add('animate-spin');
      setTimeout(() => {
        if (refreshBtn) refreshBtn.classList.remove('animate-spin');
      }, 600);
    }

    const { totalTopics, completedTopics, completionPct } = calculateOverallStats();
    const myName = currentUser ? (currentUser.name || currentUser.email.split('@')[0]) : 'You (Student)';
    const myId = currentUser ? currentUser.id : 'current_user_local';

    let peers = await fetchLeaderboardProfiles();
    peers = peers.filter(p => p.id !== myId && p.display_name.toLowerCase() !== myName.toLowerCase());

    const myEntry = {
      id: myId,
      display_name: myName,
      isCurrentUser: true,
      level: appState.gamification?.level || 1,
      xp: appState.gamification?.xp || 0,
      streak: appState.gamification?.streak || 1,
      completed_topics: completedTopics,
      total_topics: totalTopics || 315,
      completion_pct: completionPct
    };

    const combined = [...peers, myEntry];

    if (currentLeaderboardSort === 'portion') {
      combined.sort((a, b) => b.completion_pct - a.completion_pct || b.completed_topics - a.completed_topics || b.xp - a.xp);
    } else if (currentLeaderboardSort === 'xp') {
      combined.sort((a, b) => b.xp - a.xp || b.completion_pct - a.completion_pct);
    } else if (currentLeaderboardSort === 'streak') {
      combined.sort((a, b) => b.streak - a.streak || b.completion_pct - a.completion_pct);
    }

    const myRank = combined.findIndex(item => item.isCurrentUser) + 1;

    if (totalCountBadge) totalCountBadge.textContent = `${combined.length} Students`;
    if (myRankBadge) myRankBadge.textContent = `#${myRank}`;
    if (myRankName) myRankName.textContent = `${myName} (You)`;
    if (myRankCoverage) myRankCoverage.textContent = `${completionPct}%`;
    if (myRankProgressBar) myRankProgressBar.style.width = `${completionPct}%`;

    if (myRankNudge) {
      if (combined.length === 1) {
        myRankNudge.textContent = '👑 Rank #1: You are leading! Share with classmates to compete in real-time.';
      } else if (myRank === 1) {
        myRankNudge.textContent = '👑 Incredible! You are leading the entire class in syllabus preparation!';
      } else {
        const studentAhead = combined[myRank - 2];
        const aheadGap = studentAhead ? Math.max(1, studentAhead.completed_topics - completedTopics) : 2;
        myRankNudge.textContent = `⚡ Only ${aheadGap} more topics needed to overtake #${myRank - 1} (${studentAhead?.display_name || 'Classmate'})!`;
      }
    }

    const top3 = combined.slice(0, 3);
    const podiumOrder = [
      { student: top3[1], rank: 2, badge: '🥈', class: 'podium-2' },
      { student: top3[0], rank: 1, badge: '👑', class: 'podium-1' },
      { student: top3[2], rank: 3, badge: '🥉', class: 'podium-3' }
    ];

    podiumContainer.innerHTML = podiumOrder.map(slot => {
      const st = slot.student;
      if (!st) {
        return `
          <div class="flex flex-col items-center justify-end ${slot.class} p-2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center opacity-50">
            <span class="text-base mb-0.5">${slot.badge}</span>
            <span class="text-[10px] font-bold text-slate-400 mt-2">Open Spot</span>
            <span class="text-[9px] text-slate-400">Classmate</span>
          </div>
        `;
      }
      const isMe = st.isCurrentUser;
      return `
        <div class="flex flex-col items-center justify-end ${slot.class} p-2 rounded-2xl relative ${isMe ? 'ring-2 ring-indigo-500' : ''}">
          <span class="text-base mb-0.5">${slot.badge}</span>
          <div class="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-black shadow-xs mb-1">
            ${escapeHtml(st.display_name.charAt(0).toUpperCase())}
          </div>
          <span class="text-[11px] font-black truncate max-w-[80px] text-slate-800 dark:text-slate-100 ${isMe ? 'text-indigo-600 dark:text-indigo-400' : ''}">
            ${escapeHtml(st.display_name)}${isMe ? ' (You)' : ''}
          </span>
          <span class="text-[10px] font-extrabold text-amber-500 mt-0.5">
            ${currentLeaderboardSort === 'portion' ? `${st.completion_pct}%` : currentLeaderboardSort === 'xp' ? `${st.xp} XP` : `🔥 ${st.streak}d`}
          </span>
          <span class="text-[9px] text-slate-400">Lv.${st.level || 1}</span>
        </div>
      `;
    }).join('');

    let rosterHtml = combined.map((st, idx) => {
      const rank = idx + 1;
      const isMe = st.isCurrentUser;
      const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      
      return `
        <div class="flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 ${isMe ? 'leaderboard-you' : ''}">
          <div class="w-6 text-center text-xs font-black ${rank <= 3 ? 'text-amber-500' : 'text-slate-400'}">
            ${rankBadge}
          </div>
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            ${escapeHtml(st.display_name.charAt(0).toUpperCase())}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-slate-800 dark:text-slate-200 truncate ${isMe ? 'text-indigo-600 dark:text-indigo-400' : ''}">
                ${escapeHtml(st.display_name)} ${isMe ? '<span class="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-500 text-white ml-1">YOU</span>' : ''}
              </span>
              <span class="text-[11px] font-black text-indigo-600 dark:text-indigo-400">
                ${st.completion_pct}%
              </span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden my-1">
              <div class="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full" style="width: ${st.completion_pct}%"></div>
            </div>
            <div class="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>${st.completed_topics}/${st.total_topics} topics</span>
              <div class="flex items-center space-x-2">
                <span>⚡ ${st.xp} XP</span>
                <span>🔥 ${st.streak}d</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (combined.length === 1) {
      rosterHtml += `
        <div class="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-1 mt-2">
          <p class="text-xs font-bold text-slate-700 dark:text-slate-200">👑 Real Peer Ranking Active</p>
          <p class="text-[10px]">No demo data. As classmates log in on other devices, their live syllabus progress will automatically rank here!</p>
        </div>
      `;
    }

    rosterList.innerHTML = rosterHtml;

    if (window.lucide) window.lucide.createIcons();
  }

  function initLeaderboardHandlers() {
    const btnSortPortion = document.getElementById('btn-sort-portion');
    const btnSortXP = document.getElementById('btn-sort-xp');
    const btnSortStreak = document.getElementById('btn-sort-streak');

    function updateSortButtons(activeBtn) {
      [btnSortPortion, btnSortXP, btnSortStreak].forEach(b => {
        if (!b) return;
        if (b === activeBtn) {
          b.className = 'flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs text-center transition-all';
        } else {
          b.className = 'flex-1 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 text-center transition-all hover:text-slate-800 dark:hover:text-slate-200';
        }
      });
    }

    if (btnSortPortion) {
      btnSortPortion.addEventListener('click', () => {
        currentLeaderboardSort = 'portion';
        updateSortButtons(btnSortPortion);
        renderLeaderboard();
      });
    }

    if (btnSortXP) {
      btnSortXP.addEventListener('click', () => {
        currentLeaderboardSort = 'xp';
        updateSortButtons(btnSortXP);
        renderLeaderboard();
      });
    }

    if (btnSortStreak) {
      btnSortStreak.addEventListener('click', () => {
        currentLeaderboardSort = 'streak';
        updateSortButtons(btnSortStreak);
        renderLeaderboard();
      });
    }

    const btnRefresh = document.getElementById('btn-refresh-leaderboard');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        renderLeaderboard(true);
        showToast('Rankings updated! 🏆');
      });
    }

    const btnShareWhatsapp = document.getElementById('btn-share-rank-whatsapp');
    if (btnShareWhatsapp) {
      btnShareWhatsapp.addEventListener('click', () => {
        const { completedTopics, totalTopics, completionPct } = calculateOverallStats();
        const myName = currentUser ? (currentUser.name || currentUser.email.split('@')[0]) : 'Student';
        const myXP = appState.gamification?.xp || 0;
        const myStreak = appState.gamification?.streak || 1;
        const rankText = document.getElementById('my-rank-badge')?.textContent || '#1';

        const message = `🎯 *Semester 3 NERVE Challenge!*
Hey! I'm preparing for Sem 3 exams on NERVE and I'm currently ranked *${rankText}* with *${completionPct}% syllabus covered* (${completedTopics}/${totalTopics} topics complete)! 🔥
⚡ Score: ${myXP} XP | Streak: ${myStreak} days
Can you beat my preparation pace? Track your syllabus progress here!`;

        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
      });
    }
  }

  // --- PRINT CHECKLIST ---
  const btnPrint = document.getElementById('btn-print');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }

  // --- FILTERS & SEARCH ---
  document.getElementById('search-input').addEventListener('input', (e) => {
    currentFilter.search = e.target.value.trim();
    renderModulesAndTopics();
  });

  document.querySelectorAll('.filter-status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-status-btn').forEach(b => {
        b.className = 'filter-status-btn px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0 transition';
      });
      btn.className = 'filter-status-btn px-3 py-1.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs transition';
      currentFilter.status = btn.dataset.filterStatus;
      renderModulesAndTopics();
    });
  });

  document.getElementById('btn-reset-filters').addEventListener('click', () => {
    currentFilter.status = 'all';
    currentFilter.search = '';
    document.getElementById('search-input').value = '';
    document.querySelectorAll('.filter-status-btn').forEach(b => {
      b.className = b.dataset.filterStatus === 'all'
        ? 'filter-status-btn px-3 py-1.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs transition'
        : 'filter-status-btn px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0 transition';
    });
    renderModulesAndTopics();
  });

  // --- THEME ---
  const themeToggle = document.getElementById('theme-toggle');
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    // Quantix AI Obsidian Dark Theme default
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    if (window.lucide) window.lucide.createIcons();
  });

  // Subject change
  document.getElementById('subject-selector').addEventListener('change', (e) => {
    if (e.target.value === '__ai_add_course__') {
      e.target.value = appState.activeSubjectId || '';
      openModal('modal-ai-syllabus');
      return;
    }
    appState.activeSubjectId = e.target.value;
    saveState();
    renderHeroBanner();
    renderStats();
    renderModulesAndTopics();
    populateTimerTopics();
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- INITIALIZE ---
  function init() {
    initTheme();
    initGamification();
    initDailyGoal();
    initFirebase();
    checkAuthGate();
    if (currentUser && currentUser.email) {
      loadStudentCloudData();
    }
    initGateAuthHandlers();
    initAISyllabusGenerator();
    renderSubjectSelector();
    renderHeroBanner();
    renderStats();
    renderModulesAndTopics();
    populateTimerTopics();
    updatePomodoroDisplay();
    renderLeaderboard();
    initLeaderboardHandlers();
    initSyncCodeHandlers();

    if (window.lucide) window.lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
