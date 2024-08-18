grammar Masala

entry Model:
    (persons+=Person | greetings+=Greeting | entities+=Entity | elements+=AbstractElement | atoms+=Atom | molecules+=Molecule | organisms+=Organism
    | pages+=Page)*;

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

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
