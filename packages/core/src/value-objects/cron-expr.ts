import { z } from "zod";

const CRON_REGEX = /^(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+)(ns|us|µs|ms|s|m|h))|((((\d+,)+\d+|(\d+)(\/|-)(\d+)|\d+|\*) ?){5,6})$/;

export class CronExpression {
  private constructor(private readonly value: string) {}

  static create(value: string): CronExpression {
    if (!CRON_REGEX.test(value.trim())) {
      throw new Error(`Invalid cron expression: ${value}`);
    }
    return new CronExpression(value.trim());
  }

  toString(): string {
    return this.value;
  }
}

export const CronExpressionSchema = z
  .string()
  .regex(CRON_REGEX, "Invalid cron expression")
  .transform((v) => CronExpression.create(v));
