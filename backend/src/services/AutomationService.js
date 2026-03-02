const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AutomationService {
  /**
   * Get all automation rules
   */
  static async getAllRules() {
    try {
      const rules = await prisma.automationRule.findMany({
        include: {
          creator: {
            select: { id: true, name: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return rules;
    } catch (error) {
      console.error('❌ Error fetching automation rules:', error);
      throw error;
    }
  }

  /**
   * Create a new automation rule
   */
  static async createRule(ruleData, userId) {
    try {
      const rule = await prisma.automationRule.create({
        data: {
          ...ruleData,
          createdBy: userId
        },
        include: {
          creator: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      });

      return rule;
    } catch (error) {
      console.error('❌ Error creating automation rule:', error);
      throw error;
    }
  }

  /**
   * Toggle automation rule active status
   */
  static async toggleRule(ruleId) {
    try {
      const rule = await prisma.automationRule.findUnique({
        where: { id: ruleId }
      });

      if (!rule) {
        throw new Error('Automation rule not found');
      }

      const updatedRule = await prisma.automationRule.update({
        where: { id: ruleId },
        data: { active: !rule.active },
        include: {
          creator: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      });
      
      return updatedRule;
    } catch (error) {
      console.error('❌ Error toggling automation rule:', error);
      throw error;
    }
  }

  /**
   * Delete an automation rule
   */
  static async deleteRule(ruleId) {
    try {
      const rule = await prisma.automationRule.findUnique({
        where: { id: ruleId }
      });

      if (!rule) {
        throw new Error('Automation rule not found');
      }

      await prisma.automationRule.delete({
        where: { id: ruleId }
      });

      return { success: true, message: 'Automation rule deleted successfully' };
    } catch (error) {
      console.error('❌ Error deleting automation rule:', error);
      throw error;
    }
  }
}

module.exports = AutomationService;
