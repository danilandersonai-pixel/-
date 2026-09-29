import { membershipFormToFields, membershipStatus } from './memberships';

describe('абонемент', () => {
  const done = ['2026-08-30', '2026-09-02', '2026-09-05', '2026-09-09', '2026-09-12', '2026-10-05'];

  it('считает проведённые с даты начала и до конца срока', () => {
    const status = membershipStatus({ total: 8, startDate: '2026-09-01', endDate: '2026-09-30' }, done, '2026-09-15');
    expect(status).toMatchObject({ used: 4, remaining: 4, expired: false, exhausted: false, ending: false, daysLeft: 15 });
  });

  it('заканчивается, использован, истёк', () => {
    expect(membershipStatus({ total: 6, startDate: '2026-09-01', endDate: null }, done, '2026-10-06')).toMatchObject({
      used: 5,
      remaining: 1,
      ending: true,
      daysLeft: null,
    });
    expect(membershipStatus({ total: 4, startDate: '2026-09-01', endDate: null }, done, '2026-10-06')).toMatchObject({
      remaining: 0,
      exhausted: true,
      ending: false,
    });
    expect(membershipStatus({ total: 12, startDate: '2026-09-01', endDate: '2026-09-30' }, done, '2026-10-06')).toMatchObject({
      used: 4,
      expired: true,
      ending: false,
    });
  });

  it('форма: количество, даты, порядок дат', () => {
    expect(membershipFormToFields({ total: '12', startDate: '01.09.2026', endDate: '', notes: ' ' })).toEqual({
      fields: { total: 12, startDate: '2026-09-01', endDate: null, notes: null },
      errors: {},
    });
    expect(membershipFormToFields({ total: '', startDate: '', endDate: '', notes: '' }).errors).toEqual({
      total: 'required',
      startDate: 'required',
    });
    expect(membershipFormToFields({ total: '0', startDate: '01.09.2026', endDate: '01.08.2026', notes: '' }).errors).toEqual({
      total: 'invalid',
      endDate: 'order',
    });
  });
});
