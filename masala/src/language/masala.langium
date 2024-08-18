grammar Masala
import "./common"


entry I2P:
    (elements+=AbstractElement)*;

AbstractElement:
    PackageDeclaration | Type;

PackageDeclaration:
    'package' name=QualifiedName '{'
        (elements+=AbstractElement)*
    '}';

Type:
    DataType | Entity| INT | DOUBLE | NAME;

Entity:
    'entity' name=ID ('extends' superType=[Entity:QualifiedName])? '{'
        (features+=Feature)+
        (stringProperties+=StringProperty)*
        (intProperties+=INTProperty)*
    '}';

Feature:
    (many?='many')? name=ID ':' type=[Type:QualifiedName] isRequired?='required'?;

StringProperty:
    name=ID ':' type=[Type:QualifiedName] isRequired?='required'? (default=DefaultStringValue)? (minLength=MinStringLength)? (maxLength=MaxStringLength)?;

INTProperty:
    name=ID ':' type=[Type:QualifiedName] isRequired?='required'? (default=DefaultINTValue)? (min=MinIntValue)? (max=MaxIntValue)?;

DefaultStringValue returns string:
    'default('ID')';

MinStringLength returns number:
    'minLength('INT')';

MaxStringLength returns number:
    'maxLength('INT')';

DefaultINTValue returns number:
    'default('INT')';

MinIntValue returns number:
    'min('INT')';

MaxIntValue returns number:
    'max('INT')';
