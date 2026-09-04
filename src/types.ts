export interface Citation {
  source: string;
  code: string;
  clause?: string;
  title: string;
  description: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  language?: 'en' | 'hi';
  citations?: Citation[];
  suggestedQueries?: string[];
  productMatch?: {
    standardCode: string;
    productName: string;
    scheme: string;
    isMandatory: boolean;
  };
  keyAction?: {
    label: string;
    action: string;
    targetTab?: string;
    payload?: any;
  };
}

export interface StandardItem {
  code: string; // e.g. "IS 5522:2014"
  title: string; // e.g. "Stainless Steel Utensils — Specification"
  hindiTitle?: string;
  sector: 'Consumer Goods' | 'Food & Agriculture' | 'Electronics & IT' | 'Civil & Construction' | 'Automotive & Safety' | 'Chemical & Metallurgy' | 'Medical & Health' | 'Textiles & Toys';
  scheme: 'Scheme-I (ISI Mark)' | 'Scheme-II (CRS)' | 'Scheme-IV (Hallmarking)' | 'Scheme-V (FMCS)' | 'ECO Mark';
  isMandatoryQCO: boolean;
  qcoDetails?: {
    orderName: string;
    ministry: string;
    effectiveDate: string;
    penaltyClause: string;
  };
  applicableProducts: string[];
  keyClauses: {
    clauseNumber: string;
    clauseTitle: string;
    summary: string;
  }[];
  criticalTests: string[];
  recognizedLabsCount: number;
  markingFeeAnnual: string;
  descriptionEn: string;
  descriptionHi: string;
}

export interface LabItem {
  id: string;
  name: string;
  category: 'Central Lab' | 'Regional Lab' | 'Branch Lab' | 'NABL Recognized Partner Lab';
  city: string;
  state: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  testingScopes: string[];
  standardsSupported: string[];
  accreditationStatus: string;
}

export interface SchemeInfo {
  id: string;
  code: string;
  title: string;
  hindiTitle: string;
  badge: string;
  description: string;
  whoNeedsIt: string;
  processSteps: {
    step: number;
    title: string;
    detail: string;
  }[];
  fees: {
    applicationFee: string;
    inspectionFee: string;
    annualMarkingFee: string;
    msmeConcession: string;
  };
  sampleProducts: string[];
}

export interface VerificationCheck {
  queryType: 'huid' | 'cml' | 'crs';
  inputCode: string;
  isValidFormat: boolean;
  mockResult?: {
    entityName?: string;
    standard?: string;
    productCategory?: string;
    status?: 'Active & Verified' | 'Expired' | 'Suspended' | 'Invalid / Fake';
    validUntil?: string;
    hallmarkingCenter?: string;
    purity?: string;
    jewellerName?: string;
    centerCode?: string;
  };
  explanation: string;
  checklist: string[];
}
