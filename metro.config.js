const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Миграции Drizzle: разрешаем импорт .sql-файлов
config.resolver.sourceExts.push('sql');

module.exports = config;
