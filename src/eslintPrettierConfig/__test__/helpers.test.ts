import { mapExtendsArray } from '../helpers';

describe('ESLint Prettier Configuration', () => {
  describe('mapExtendsArray', () => {
    it('should return an empty object if array is empty', () => {
      expect(mapExtendsArray([])).toStrictEqual({});
    });

    it('should return a simple object with no prettier position if no prettier plugin are used', () => {
      const extendsArray = ['eslint', 'react'];
      expect(mapExtendsArray(extendsArray)).toStrictEqual({
        eslint: {
          pluginName: 'eslint',
          prettierPluginName: '',
          position: 0,
          prettierPosition: -1
        },
        react: {
          pluginName: 'react',
          prettierPluginName: '',
          position: 1,
          prettierPosition: -1
        }
      });
    });

    it('should return an object without prettier plugin and no pluginName if only a prettier plugin is present', () => {
      const extendsArray = ['prettier/react'];
      expect(mapExtendsArray(extendsArray)).toStrictEqual({
        react: {
          pluginName: '',
          prettierPluginName: 'prettier/react',
          position: -1,
          prettierPosition: 0
        }
      });
    });

    it('should return an object with a single object if both the plugin and its prettier counterpart are present', () => {
      const extendsArray = ['react', 'prettier/react'];
      expect(mapExtendsArray(extendsArray)).toStrictEqual({
        react: {
          pluginName: 'react',
          prettierPluginName: 'prettier/react',
          position: 0,
          prettierPosition: 1
        }
      });
    });

    it('should return an object with two objects if both the plugin and its prettier counterpart are present times 2', () => {
      const extendsArray = ['react', 'vue', 'prettier/react', 'prettier/vue'];
      expect(mapExtendsArray(extendsArray)).toStrictEqual({
        react: {
          pluginName: 'react',
          prettierPluginName: 'prettier/react',
          position: 0,
          prettierPosition: 2
        },
        vue: {
          pluginName: 'vue',
          prettierPluginName: 'prettier/vue',
          position: 1,
          prettierPosition: 3
        }
      });
    });

    it('should return an object with two objects with the right positions if the plugins and prettier plugins are intertwined', () => {
      const extendsArray = ['react', 'prettier/react', 'vue', 'prettier/vue'];
      expect(mapExtendsArray(extendsArray)).toStrictEqual({
        react: {
          pluginName: 'react',
          prettierPluginName: 'prettier/react',
          position: 0,
          prettierPosition: 1
        },
        vue: {
          pluginName: 'vue',
          prettierPluginName: 'prettier/vue',
          position: 2,
          prettierPosition: 3
        }
      });
    });

    it('should return an object with eslint as the key when prettier is the prettier plugin', () => {
      const extendsArray = ['eslint:recommended', 'prettier'];
      expect(mapExtendsArray(extendsArray)).toStrictEqual({
        eslint: {
          pluginName: 'eslint:recommended',
          prettierPluginName: 'prettier',
          position: 0,
          prettierPosition: 1
        }
      });
    });
  });
});
