import { applyExtendsArrayOrderRule, checkESLINTConfigurationRules } from '../EslintConfiguration';
import { extendsObject } from '../types';
import { MessageCategory, MessageType } from '../../types';

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

  describe('checkESLINTConfigurationRules', () => {
    it('should return an empty array if no plugins are present', () => {
      expect(checkESLINTConfigurationRules({ configuration: {}, usingPrettier: true })).toStrictEqual([]);
    });

    it('should return an empty array if a plugin is present but has no prettier equivalent', () => {
      expect(
        checkESLINTConfigurationRules({ configuration: { extends: ['plugin'] }, usingPrettier: true })
      ).toStrictEqual([]);
    });

    it('should return an error array if a plugin is present and has a prettier equivalent extended in the wrong order', () => {
      const messages = checkESLINTConfigurationRules({
        configuration: {
          extends: ['prettier/react', 'react']
        },
        usingPrettier: true
      });
      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty('category', MessageCategory.ExtendsArrayOrder);
    });

    it('should return a Missing Prettier Plugin error if a plugin is present and has a prettier equivalent not extended', () => {
      const messages = checkESLINTConfigurationRules({
        configuration: {
          extends: ['react']
        },
        usingPrettier: true,
        ESLintPrettierPlugins: ['react']
      });
      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty('category', MessageCategory.MissingPrettierPlugin);
    });

    it('should not return an error if a plugin is present which has no prettier equivalent', () => {
      const messages = checkESLINTConfigurationRules({
        configuration: {
          extends: ['react']
        },
        usingPrettier: true,
        ESLintPrettierPlugins: ['vue']
      });
      expect(messages).toHaveLength(0);
    });

    it('should not return an error if two plugins are present with their prettier counterparts intertwined', () => {
      const messages = checkESLINTConfigurationRules({
        configuration: {
          extends: ['react', 'prettier/react', 'vue', 'prettier/vue']
        },
        usingPrettier: true,
        ESLintPrettierPlugins: ['vue', 'react']
      });
      expect(messages).toHaveLength(0);
    });

    it('should not return an error if two plugins are present with their prettier counterparts', () => {
      const messages = checkESLINTConfigurationRules({
        configuration: {
          extends: ['react', 'vue', 'prettier/vue', 'prettier/react']
        },
        usingPrettier: true,
        ESLintPrettierPlugins: ['vue', 'react']
      });
      expect(messages).toHaveLength(0);
    });

    it('should not return an error usingPrettier is set to false', () => {
      const messages = checkESLINTConfigurationRules({
        configuration: {
          extends: ['react', 'vue']
        },
        usingPrettier: false,
        ESLintPrettierPlugins: ['vue', 'react']
      });
      expect(messages).toHaveLength(0);
    });

    it('should return an error when using the eslint:recommended plugin and prettier', () => {
      const messages = checkESLINTConfigurationRules({
        configuration: {
          extends: ['prettier', 'eslint:recommended']
        },
        usingPrettier: true,
        ESLintPrettierPlugins: ['eslint']
      });
      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty('category', MessageCategory.ExtendsArrayOrder);
    });

    it('should return an error when using the eslint:recommended plugin without the prettier plugin', () => {
      const messages = checkESLINTConfigurationRules({
        configuration: {
          extends: ['eslint:recommended']
        },
        usingPrettier: true,
        ESLintPrettierPlugins: ['eslint']
      });
      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty('category', MessageCategory.MissingPrettierPlugin);
    });
  });

  describe('checkESLINTConfigurationRules for rule overrides', () => {
    it('should return an empty array if no rules have overriden the main prettier plugin', () => {
      expect(
        checkESLINTConfigurationRules({
          configuration: { extends: ['prettier/react'], rules: { ruleOverrideName: 0 } },
          usingPrettier: true,
          ESLintPrettierPlugins: ['react'],
          ESLintPrettierErrorRules: { react: [] },
          ESLintPrettierWarningRules: { react: [] }
        })
      ).toStrictEqual([]);
    });

    it('should return an empty array if no prettier plugins are extended with the plugin', () => {
      expect(
        checkESLINTConfigurationRules({
          configuration: { extends: ['vue', 'prettier/vue', 'react'], rules: { ruleOverrideName: 0 } },
          usingPrettier: true,
          ESLintPrettierPlugins: ['vue'],
          ESLintPrettierErrorRules: { react: ['ruleOverrideName'] },
          ESLintPrettierWarningRules: { react: ['ruleOverrideName'] }
        })
      ).toStrictEqual([]);
    });

    it('should return a override error array if a rule overrides a prettier plugin', () => {
      const messages = checkESLINTConfigurationRules({
        configuration: { extends: ['vue', 'prettier/vue', 'react'], rules: { ruleOverrideName: 0 } },
        usingPrettier: true,
        ESLintPrettierPlugins: ['vue'],
        ESLintPrettierErrorRules: { vue: ['ruleOverrideName'] },
        ESLintPrettierWarningRules: { vue: [] }
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty('category', MessageCategory.ExtendsArrayRuleOverride);
      expect(messages[0]).toHaveProperty('type', MessageType.ERROR);
    });

    it('should return a override warning array if a rule overrides a prettier plugin', () => {
      const messages = checkESLINTConfigurationRules({
        configuration: { extends: ['vue', 'prettier/vue', 'react'], rules: { ruleOverrideName: 0 } },
        usingPrettier: true,
        ESLintPrettierPlugins: ['vue'],
        ESLintPrettierErrorRules: { vue: [] },
        ESLintPrettierWarningRules: { vue: ['ruleOverrideName'] }
      });

      expect(messages).toHaveLength(1);
      expect(messages[0]).toHaveProperty('category', MessageCategory.ExtendsArrayRuleOverride);
      expect(messages[0]).toHaveProperty('type', MessageType.WARN);
    });
  });
});
