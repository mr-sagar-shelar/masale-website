import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { MasalaAstType, Person, Model } from './generated/ast.js';
import type { MasalaServices } from './masala-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: MasalaServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MasalaValidator;
    const checks: ValidationChecks<MasalaAstType> = {
        Person: validator.checkPersonStartsWithCapital,
        Model: validator.checkPersonAreGreetedAtMostOnce,
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

    checkPersonAreGreetedAtMostOnce(model: Model, accept: ValidationAcceptor): void {
        //create a multi-counter variable using a map
        const counts = new Map<Person, number>();
        //initialize the counter for each person to zero
        model.persons.forEach(p => counts.set(p, 0));
        //iterate over all greetings and count the number of greetings for each person
        model.greetings.forEach(g => {
            const person = g.person.ref;
            //Attention! if the linker was unsucessful, person is undefined
            if(person) {
                //set the new value of the counter
                const newValue = counts.get(person)!+1;
                counts.set(person, newValue);
                //if the counter is greater than 1, create a helpful error
                if(newValue > 1) {
                    accept('error', `You can great each person at most once! This is the ${newValue}${newValue==2?'nd':'th'} greeting to ${person.name}.`, {
                        node: g
                    });
                }
            }
        });

        this.checkEntityNameUnique(model, accept);
    }

    checkEntityNameUnique(model: Model, accept: ValidationAcceptor): void {
        //create a multi-counter variable using a map
        const counts = new Map<string, number>();
        //initialize the counter for each person to zero
        model.entities.forEach(p => counts.set(p.name, 0));
        //iterate over all greetings and count the number of greetings for each person
        model.entities.forEach(entity => {
            //Attention! if the linker was unsucessful, entity is undefined
                //set the new value of the counter
            const newValue = counts.get(entity.name)!+1;
            counts.set(entity.name, newValue);
            //if the counter is greater than 1, create a helpful error
            if(newValue > 1) {
                accept('error', `You can define entity at most once! This is the ${newValue}${newValue==2?'nd':'th'} greeting to ${entity.name}.`, {
                    node: entity
                });
            }
        });
    }
}
