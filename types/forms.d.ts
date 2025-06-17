export interface FormContactUsData {
    guardian_first_name: string;
    guardian_last_name: string;
    student_first_name: string;
    student_last_name: string;
    guardian_email: string;
    guardian_phone: string;
    newsletter: boolean;
    online: boolean;
    location: string;
    inquiry_type: string;
    message: string;
    date: Date;
    recaptcha: string;
}

export interface FormScorgiInterest {
    nameFirst: string;
    nameLast: string;
    email: string;
    phone: string;
    message: string;
    recaptcha: string;
    company: {
        name: string;
        description: string;
        address: {
            street: string;
            city: string;
            state: string;
            zip: string;
        };
    };
    jobTitle: string;
    students: number;
    billing: {
        name: string;
        email: string;
        phone: string;
        address: {
            street: string;
            city: string;
            state: string;
            zip: string;
        };
    };
}
