grammar Masala

entry Model:
    (persons+=Person | greetings+=Greeting | entities+=Entity | elements+=AbstractElement | atoms+=Atom | molecules+=Molecule)*;

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

QualifiedName returns string:
    ID ('.' ID)*;

DataType:
    'datatype' name=ID;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
