import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneField', async: false })
export class AtLeastOneFieldValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const object = args.object as any; // Отримуємо весь об'єкт DTO
    console.log('object :>> ', object);
    return !!(object?.name || object?.image); // Перевіряємо, чи хоча б одне поле заповнено
  }

  defaultMessage(): string {
    return 'At least one of "name" or "image" must be provided.';
  }
}
