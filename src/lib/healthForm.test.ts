import { formToHealthFields, healthToFormValues } from './healthForm';

describe('форма здоровья', () => {
  it('пустая запись даёт пустые поля', () => {
    expect(healthToFormValues(null)).toEqual({ contraindications: '', injuries: '', limitations: '', notes: '' });
  });

  it('обрезает пробелы и пустое превращает в null', () => {
    expect(
      formToHealthFields({ contraindications: ' Гипертония ', injuries: '', limitations: '  ', notes: 'Колено' }),
    ).toEqual({ contraindications: 'Гипертония', injuries: null, limitations: null, notes: 'Колено' });
  });
});
