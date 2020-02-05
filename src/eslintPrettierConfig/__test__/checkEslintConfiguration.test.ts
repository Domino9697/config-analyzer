import { applyExtendsArrayOrderRule, checkESLINTConfiguration } from '../checkEslintConfiguration';
import { extendsObject } from '../types';
import { MessageCategory } from '../../types';

describe('ESLint Prettier Configuration', () => {
  describe('applyExtendsArrayOrderRule', () => {
    it('should return an empty array if no plugins are present', () => {
      expect(applyExtendsArrayOrderRule({}, [])).toStrictEqual([]);
    });

    it('should return an empty array if a plugin is present but has no prettier equivalent', () => {
      const extendsObject: extendsObject = {
        eslint: {
          pluginName: 'eslint',
          prettierPluginName: '',
          position: 0,
          prettierPosition: -1
        }
      };
      expect(applyExtendsArrayOrderRule(extendsObject, [])).toStrictEqual([]);
    });

    it('should return an empty array if a plugin is present and has a prettier equivalent extended in the right order', () => {
      const extendsObject: extendsObject = {
        eslint: {
          pluginName: 'eslint:recommended',
          prettierPluginName: 'prettier',
          position: 0,
          prettierPosition: 1
        }
      };
      expect(applyExtendsArrayOrderRule(extendsObject, ['prettier'])).toStrictEqual([]);
    });

    it('should return an empty array if two plugins are present and have a prettier equivalent extended in the right order but intertwined', () => {
      const extendsObject: extendsObject = {
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
      };
      expect(applyExtendsArrayOrderRule(extendsObject, ['react', 'vue'])).toStrictEqual([]);
    });

    it('should return an error array if a plugin is present and has a prettier equivalent extended in the wrong order', () => {
      const extendsObject: extendsObject = {
        react: {
          pluginName: 'react',
          prettierPluginName: 'prettier/react',
          position: 1,
          prettierPosition: 0
        }
      };
      expect(applyExtendsArrayOrderRule(extendsObject, ['react'])[0]).toHaveProperty(
        'category',
        MessageCategory.ExtendsArrayOrder
      );
    });
  });

  describe('checkEslintConfiguration', () => {
    it('should return an empty array if no plugins are present', () => {
      expect(checkESLINTConfiguration({configuration: {}, usingPrettier: true})).toStrictEqual([]);
    });

    it('should return an empty array if a plugin is present but has no prettier equivalent', () => {
      expect(checkESLINTConfiguration({configuration: { extends: ['plugin'] }, usingPrettier: true})).toStrictEqual([]);
    });

    it('should return an error array if a plugin is present and has a prettier equivalent extended in the wrong order', () => {
      const messages = checkESLINTConfiguration({
        configuration: {
          extends: ['prettier/react', 'react']
        },
        usingPrettier: true
      });
      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty('category', MessageCategory.ExtendsArrayOrder)
    });

    it('should return a Missing Prettier Plugin error if a plugin is present and has a prettier equivalent not extended', () => {
      const messages = checkESLINTConfiguration({
        configuration: {
          extends: ['react']
        },
        usingPrettier: true,
        ESLintPrettierPlugins: ['react']
      });
      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty('category', MessageCategory.MissingPrettierPlugin)
    });

    it('should not return an error if a plugin is present which has no prettier equivalent', () => {
      const messages = checkESLINTConfiguration({
        configuration: {
          extends: ['react']
        },
        usingPrettier: true,
        ESLintPrettierPlugins: ['vue']
      });
      expect(messages).toHaveLength(0);
    });

    it('should not return an error if two plugins are present with their prettier counterparts intertwined', () => {
      const messages = checkESLINTConfiguration({
        configuration: {
          extends: ['react', 'prettier/react', 'vue', 'prettier/vue']
        },
        usingPrettier: true,
        ESLintPrettierPlugins: ['vue', 'react']
      });
      expect(messages).toHaveLength(0);
    });

    it('should not return an error if two plugins are present with their prettier counterparts', () => {
      const messages = checkESLINTConfiguration({
        configuration: {
          extends: ['react', 'vue', 'prettier/vue', 'prettier/react']
        },
        usingPrettier: true,
        ESLintPrettierPlugins: ['vue', 'react']
      });
      expect(messages).toHaveLength(0);
    });

    it('should not return an error usingPrettier is set to false', () => {
      const messages = checkESLINTConfiguration({
        configuration: {
          extends: ['react', 'vue']
        },
        usingPrettier: false,
        ESLintPrettierPlugins: ['vue', 'react']
      });
      expect(messages).toHaveLength(0);
    });
  });
});
