export const BRANCHES = ["Computer Science", "Mechanical", "Electrical", "Civil", "EEE", "Common"];

export const BRANCH_CATEGORIES: Record<string, string[]> = {
  Mechanical: ["CAD Files (.STEP/.IGES)", "AutoCAD Files (.dwg)", "SolidWorks Files", "CATIA Files", "FEA Simulation", "BOM (Bill of Materials)", "Blueprints", "Technical Drawings", "Product Design Report", "Manufacturing Process Doc", "Thermal Analysis", "Fluid Dynamics Simulation", "Notes"],
  Electrical: ["PCB Layout (Gerber)", "Schematic Diagrams", "Circuit Design", "MATLAB Simulation", "VHDL / Verilog Code", "Embedded C Code", "Arduino / ESP32 Project", "Power System Design", "Signal Processing Script", "Control System Design", "Lab Manual", "Notes"],
  EEE: ["PCB Layout (Gerber)", "Power Electronics Design", "Schematic Diagrams", "MATLAB Simulation", "PLC Programming", "SCADA Design", "Renewable Energy Design", "Motor Drive Design", "Embedded Systems Code", "Lab Manual", "Notes"],
  Civil: ["AutoCAD Drawings (.dwg)", "Structural Design", "Blueprints / Floor Plans", "STAAD Pro Files", "Revit / BIM Files", "Survey Data", "Estimation & Costing Sheet", "Environmental Impact Report", "Road Design", "Bridge Design", "Soil Report Template", "Notes"],
  "Computer Science": ["API / Backend", "Frontend / UI Kit", "SaaS Template", "ML / AI Model", "Database Schema", "DevOps Script", "Mobile App Source", "Chrome Extension", "UI Design (Figma)", "System Design Doc", "DSA Sheet", "Interview Prep", "Open Source Project", "Notes"],
  Common: ["Project Report Template", "Research Paper", "Presentation (PPT)", "Resume Template", "SOP Template", "Mini Project", "Final Year Project", "Internship Report", "Lab Manual", "Viva Questions", "Previous Year Papers"],
};
