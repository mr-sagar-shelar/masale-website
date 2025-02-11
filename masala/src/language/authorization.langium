import "./common";

Role:
    'role' name=ID ;

Permission returns string:
     'Create' | 'Read' | 'Update' | 'Delete'
;

Persona:
    'persona' name=STRING '{'
        ('email' emailID=STRING)+
    '}';

