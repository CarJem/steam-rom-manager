import { languageManager } from '../../variables';
import { availableProviders } from "../../lib/image-providers/available-providers";

export const appSettings = {
  type: 'object',
  properties: {
    version: { type: 'number' },
    fuzzyMatcher: {
      type: 'object',
      default: {},
      properties: {
        timestamps: {
          type: 'object',
          default: {},
          properties: {
            check: { type: 'number', default: 0 },
            download: { type: 'number', default: 0 }
          }
        },
        verbose: { type: 'boolean', default: false },
        filterProviders: { type: 'boolean', default: true }
      }
    },
    environmentVariables:{
      type: 'object',
      default: {},
      properties: {
        steamDirectory: {type: 'string', default:""},
        retroarchPath: {type: 'string', default:""},
        raCoresDirectory: {type: 'string', default:""},
        localImagesDirectory: {type: 'string', default: ""},
      }
    },

    previewSettings: {
      type: 'object',
      default: {},
      properties: {
        retrieveCurrentSteamImages: { type: 'boolean', default: true },
        deleteDisabledShortcuts: { type: 'boolean', default: false },
        imageZoomPercentage: { type: 'number', default: 40, minimum: 30, maximum: 100 },
        preload: { type: 'boolean', default: false },
      }
    },
    enabledProviders: {
      type: 'array',
      default: ['SteamGridDB'],
      items: {
        oneOf: [
          {
            type: 'string',
            enum: availableProviders
          }
        ]
      }
    },
    language: { type: 'string', default: languageManager.getDefaultLanguage(), enum: languageManager.getAvailableLanguages() },
    offlineMode: { type: 'boolean', default: false },
    navigationWidth: { type: 'number', default: 0 },
    clearLogOnTest: { type: 'boolean', default: false }
  }
};
