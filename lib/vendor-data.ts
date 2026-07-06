export type VendorJob = {
  id: string;
  title: string;
  location: string;
  process: string;
  subProcess: string;
  qualification: string;
  department: string;
  organisation: string;
  openingDate: string;
  closingDate: string;
  jobType: string;
  shiftType: string;
  address: string;
  appliedCount: number;
  isNew: boolean;
};

export type VendorUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  vendor: string;
  createdDate: string;
};

export const VENDOR_NAME = "Credicus Business Services Pvt Ltd";

export const vendorJobs: VendorJob[] = [
  {
    id: "job-1",
    title: "Business Development Associate",
    location: "Hyderabad - HITEC City",
    process: "Sales",
    subProcess: "Field Sales",
    qualification: "Graduate",
    department: "Sales",
    organisation: "NovaCorp Solutions",
    openingDate: "2026-06-01",
    closingDate: "2026-07-31",
    jobType: "Full Time",
    shiftType: "Day Shift",
    address: "HITEC City, Hyderabad, Telangana",
    appliedCount: 22,
    isNew: true,
  },
  {
    id: "job-2",
    title: "Operations Coordinator",
    location: "Mumbai - Andheri",
    process: "Operations",
    subProcess: "Process Management",
    qualification: "Graduate",
    department: "Operations",
    organisation: "Summit Retail Group",
    openingDate: "2026-06-01",
    closingDate: "2026-07-31",
    jobType: "Full Time",
    shiftType: "Day Shift",
    address: "Andheri East, Mumbai, Maharashtra",
    appliedCount: 16,
    isNew: true,
  },
  {
    id: "job-3",
    title: "Customer Support Executive",
    location: "Bengaluru - Whitefield",
    process: "Support",
    subProcess: "Voice Process",
    qualification: "Any Graduate",
    department: "Customer Success",
    organisation: "GreenLeaf Services",
    openingDate: "2026-05-15",
    closingDate: "2026-07-15",
    jobType: "Full Time",
    shiftType: "Rotational Shift",
    address: "Whitefield, Bengaluru, Karnataka",
    appliedCount: 38,
    isNew: false,
  },
  {
    id: "job-4",
    title: "Team Lead — Recruitment",
    location: "Chennai - OMR",
    process: "HR",
    subProcess: "Talent Acquisition",
    qualification: "Graduate + 4 yrs exp",
    department: "Human Resources",
    organisation: "Horizon Staffing",
    openingDate: "2026-06-10",
    closingDate: "2026-08-10",
    jobType: "Full Time",
    shiftType: "Day Shift",
    address: "OMR Road, Chennai, Tamil Nadu",
    appliedCount: 11,
    isNew: false,
  },
];

export const vendorUsers: VendorUser[] = [
  {
    id: "vu-1",
    fullName: "Rajesh Verma",
    email: "rajesh.verma@partner.credicus.in",
    phone: "9876123450",
    role: "User",
    status: "Active",
    vendor: VENDOR_NAME,
    createdDate: "2026-07-02",
  },
  {
    id: "vu-2",
    fullName: "Pooja Singh",
    email: "pooja.singh@partner.credicus.in",
    phone: "8765432190",
    role: "User",
    status: "Active",
    vendor: VENDOR_NAME,
    createdDate: "2026-07-02",
  },
  {
    id: "vu-3",
    fullName: "Manish Gupta",
    email: "manish.gupta@partner.credicus.in",
    phone: "9123456703",
    role: "Coordinator",
    status: "Inactive",
    vendor: VENDOR_NAME,
    createdDate: "2026-06-18",
  },
];

export const CHART_LOCATIONS = ["Jaipur", "Hyderabad", "Mumbai", "Bengaluru", "Chennai"];

export const locationDailyCounts: Record<string, number[]> = {
  Jaipur: [8, 11, 14, 10],
  Hyderabad: [24, 28, 30, 26],
  Mumbai: [18, 21, 23, 19],
  Bengaluru: [14, 17, 19, 16],
  Chennai: [9, 11, 13, 10],
};

export const vendorTrendSeries = {
  labels: ["Jul 1", "Jul 2", "Jul 3", "Jul 4"],
  applied: [62, 78, 91, 118],
  selected: [4, 6, 8, 12],
  rejected: [2, 3, 5, 7],
};
