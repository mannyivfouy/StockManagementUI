export interface Register {
    fullname : string;
    username : string;
    gender : 'male' | 'female';
    dateOfBirth : Date;
    email : string;
    password : string;
    confirmPassword : string;    
}
