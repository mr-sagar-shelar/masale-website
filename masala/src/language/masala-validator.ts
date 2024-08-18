import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { MasalaAstType, Person } from './generated/ast.js';
import type { MasalaServices } from './masala-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: MasalaServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MasalaValidator;
    const checks: ValidationChecks<MasalaAstType> = {
        Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class MasalaValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
