DataType:
    'datatype' name=ID;

QualifiedName returns string:
    ID ('.' ID)*;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: ('0'..'9')+;
terminal DOUBLE returns number: INT '.' INT;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal fragment CAPITAL_LETTER: ('A'..'Z');
terminal fragment SMALL_LETTER: ('a'..'z');
terminal NAME: CAPITAL_LETTER SMALL_LETTER+;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;