export enum CaseStatus {
  SubmitForm = 'submitForm',
  SubmitDoc = 'submitDoc',
  InReview = 'inReview',
  SchedApt = 'schedApt',
  AttenApt = 'attenApt',
}

  export enum QuestionType {
    General = 'general',
    Daca = 'dacaRenewal',
    Citizenship = 'citizenship',
    Adjustment = "adjustmentOfStatus",
    I90 = "I90",
  }
  
  export enum AnswerType {
    Null = "null",
    LargeInput = 'largeInput',
    SmallInput = 'smallInput',
    Dropdown = 'dropdown',
    Date = 'date',
    Radio = 'radio',
  }

  export enum Language {
    English = 'EN',
    Spanish = 'ES',
    Vietnamese = 'VIET',
  }
  
  export type Client = {
    id: string;
    email: string;
    fullName: string;
    createdAt: Date;
    answers: Map<string, Map<string, any>>;
    cases: Array<Case>;
  };
  
  export type Case = {
    id: string;
    identifier: string;
    status: CaseStatus;
    type: string;
  };

  export type CaseType = {
    documentList: Array<string>;
    identifier: number;
    key: string;
  };
  
  export type CalendlyLink = {
    type: string;
    link: string;
  };
  
  export type Document = {
    id: string;
    url: string;
    type: string;
    createdAt: Date;
  };

  
  export type Question = {
    id: string; 
    displayText: string;
    description: string; 
    example: string;
    questionType: string;
    key: string;
    order: number;
    active: boolean;
    answerType: AnswerType;
    answerOptions: string;
    language: Language;
  };
  
  export type QuestionComponentProps = {
    id: string; 
    displayText: Map<string, string>;
    description: Map<string, string>; 
    example: Map<string, string>;
    questionType: string;
    key?: string;
    order: number;
    active?: boolean;
    answerType?: AnswerType;
    answerOptions: Map<string, string[]>;
    language?: Language;
    deleteFunc: Function;
  };
  
  export type QuestionManagerProps = {
    setNextScreen: (...args: string[]) => void;
    setPreviousScreen?: (...args: string[]) => void;
    existingAnswers: Map<string, Map<string, any>>;
    managerSpecificProps?: Dictionary; // add any specific extra props you need in here
    goBack?: any;
  };
  
  export type Dictionary = {
    [key: string]: any;
  };
  
  export type Appointment = {
    id: string;
    caseType: string;
    client: string; // is this needed?
    clientEmail: string;
    startTime: Date;
  };
  
  export type DocumentType = {
    caseType: string;
    driveLic: string;
    greenCard: string;
    poReport: string;
    // remaining types
  }

export type SirenUser = {
  uid: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export type FirebaseQueryParams = {
  field: string;
  operator: string;
  value: any;
}

