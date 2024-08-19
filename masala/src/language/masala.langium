grammar Masala

entry Model:
    (persons+=Person | greetings+=Greeting | entities+=Entity | elements+=AbstractElement | atoms+=Atom | molecules+=Molecule | organisms+=Organism
    | pages+=Page | applicationConfigs+=ApplicationConfig | enums+=Enum | paginations+=Pagination)*;

AbstractElement:
    Type;

Type:
    DataType;

Person:
    'person' name=ID;

Greeting:
    'Hello' person=[Person:ID] '!';

Entity:
    'entity' name=ID ('extends' superType=[Entity:QualifiedName])? '{'
        (features+=Feature)+
    '}';

Feature:
    (many?='many')? name=ID ':' type=[Type:QualifiedName] isRequired?='required'?;


Atom:
    'atom' name=ID;

Molecule:
    'molecule' name=ID '{'
        (atom=[Atom:ID])+
    '}';

Organism:
    'organism' name=ID '{'
        (atom=[Molecule:ID])+
    '}';

Page:
    'page' name=ID '{'
        (atom=[Organism:ID])+
    '}';

QualifiedName returns string:
    ID ('.' ID)*;

DataType:
    'datatype' name=ID;

ApplicationConfig:
    'appConfig' name=ID '{'
        ('baseName' ':' baseName=STRING)
        ('applicationType' ':' applicationType=ApplicationType)
        ('authenticationType' ':' authenticationType=AuthenticationType)
        ('databaseType' ':' databaseType=DatabaseType)
        ('clientFramework' ':' clientFramework=ClientFramework)
        ('entities' ':' entities+=[Entity:ID])+
    '}';

Pagination:
    'paginate' entity=[Entity:ID] 'with' (paginateType=PaginationType);

Enum:
    'enum' name=ID '{'
        (values+=EnumRow)+
    '}';

EnumRow:
    name=ID ('(' value=ID ')')?;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;


AuthenticationType returns string:
     'jwt' | 'session' | 'oauth2'
;

ApplicationType returns string:
     'monolith' | 'microservice' | 'gateway'
;

ClientFramework returns string:
     'anular' | 'react' | 'vue' | 'svelte' | 'no'
;

DatabaseType returns string:
     'mysql' | 'mongodb' | 'cassandra' | 'couchbase' | 'no'
;

PaginationType returns string:
     'infinite-scroll' | 'pagination' | 'pager'
;