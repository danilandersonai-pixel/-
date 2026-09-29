import { emptyClientFormValues, formToClientFields } from './clientForm';

describe('formToClientFields', () => {
  it('без имени не сохраняет', () => {
    const result = formToClientFields({ ...emptyClientFormValues, lastName: 'Петрова' });
    expect(result.fields).toBeNull();
    expect(result.errors.firstName).toBe('required');
  });

  it('обрезает пробелы, пустые поля превращает в null', () => {
    const result = formToClientFields({
      ...emptyClientFormValues,
      firstName: '  Анна ',
      goal: '   ',
      gender: 'female',
      birthDate: '01.02.1990',
    });
    expect(result.errors).toEqual({});
    expect(result.fields).toEqual({
      firstName: 'Анна',
      lastName: null,
      gender: 'female',
      birthDate: '1990-02-01',
      phone: null,
      email: null,
      messenger: null,
      goal: null,
      notes: null,
    });
  });

  it('неверную дату не сохраняет, но остальные поля сохраняет', () => {
    const result = formToClientFields({ ...emptyClientFormValues, firstName: 'Анна', birthDate: '31.02.1990' });
    expect(result.errors.birthDate).toBe('invalid');
    expect(result.fields).not.toBeNull();
    expect(result.fields).not.toHaveProperty('birthDate');
  });

  it('пустая дата стирает сохранённую', () => {
    const result = formToClientFields({ ...emptyClientFormValues, firstName: 'Анна' });
    expect(result.fields?.birthDate).toBeNull();
  });
});
