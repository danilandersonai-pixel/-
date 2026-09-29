module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Миграции Drizzle лежат в .sql-файлах — встраиваем их в код как строки
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
