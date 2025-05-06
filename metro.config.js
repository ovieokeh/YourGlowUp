const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Supabase fix
config.resolver.unstable_conditionNames = ["browser"];
config.resolver.unstable_enablePackageExports = false;
config.resolver.extraNodeModules = {
  buffer: require.resolve("buffer/"), // alias Node core module
};

module.exports = config;
