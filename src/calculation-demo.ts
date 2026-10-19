const income: number = 85000;
const expenses: number = 52300;
const savings: number = 15000;

const netIncome: number = income - expenses;
const remaining: number = netIncome - savings;

console.log('Доход за месяц:', income);
console.log('Расходы за месяц:', expenses);
console.log('Отложить:', savings);
console.log('Чистый доход:', netIncome);
console.log('Остаток после сбережений:', remaining);

export {};
