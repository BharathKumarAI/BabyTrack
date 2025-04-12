'use server';
/**
 * @fileOverview An AI agent that analyzes diaper log entries to identify potential food allergies in babies.
 *
 * - analyzeDiaperLogs - A function that handles the diaper log analysis process.
 * - AnalyzeDiaperLogsInput - The input type for the analyzeDiaperLogs function.
 * - AnalyzeDiaperLogsOutput - The return type for the analyzeDiaperLogs function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeDiaperLogsInputSchema = z.object({
  diaperLogEntries: z
    .array(
      z.object({
        date: z.string().describe('The date of the diaper change.'),
        type: z
          .enum(['wet', 'soiled', 'mixed'])
          .describe('The type of diaper change.'),
        stoolConsistency: z.string().describe('The consistency of the stool.'),
        foodIntake: z.string().describe('Foods consumed around the time of the diaper change.'),
      })
    )
    .describe('A list of diaper log entries.'),
});
export type AnalyzeDiaperLogsInput = z.infer<typeof AnalyzeDiaperLogsInputSchema>;

const AnalyzeDiaperLogsOutputSchema = z.object({
  possibleAllergies: z
    .array(z.string())
    .describe('A list of possible food allergies based on the diaper log entries.'),
  summary: z.string().describe('A summary of the analysis.'),
});
export type AnalyzeDiaperLogsOutput = z.infer<typeof AnalyzeDiaperLogsOutputSchema>;

export async function analyzeDiaperLogs(input: AnalyzeDiaperLogsInput): Promise<AnalyzeDiaperLogsOutput> {
  return analyzeDiaperLogsFlow(input);
}

const analyzeDiaperLogsPrompt = ai.definePrompt({
  name: 'analyzeDiaperLogsPrompt',
  input: {
    schema: z.object({
      diaperLogEntries: z
        .array(
          z.object({
            date: z.string().describe('The date of the diaper change.'),
            type: z
              .enum(['wet', 'soiled', 'mixed'])
              .describe('The type of diaper change.'),
            stoolConsistency: z.string().describe('The consistency of the stool.'),
            foodIntake: z.string().describe('Foods consumed around the time of the diaper change.'),
          })
        )
        .describe('A list of diaper log entries.'),
    }),
  },
  output: {
    schema: z.object({
      possibleAllergies: z
        .array(z.string())
        .describe('A list of possible food allergies based on the diaper log entries.'),
      summary: z.string().describe('A summary of the analysis.'),
    }),
  },
  prompt: `You are an AI assistant that analyzes diaper log entries to help identify potential food allergies in babies.

  Analyze the following diaper log entries to identify potential food allergies. Pay close attention to the stool consistency and any patterns between food intake and diaper changes.

  Diaper Log Entries:
  {{#each diaperLogEntries}}
  - Date: {{date}}, Type: {{type}}, Stool Consistency: {{stoolConsistency}}, Food Intake: {{foodIntake}}
  {{/each}}

  Based on the diaper log entries, what are the possible food allergies? Provide a summary of your analysis.
  The possibleAllergies field should be a list of strings.
  `,
});

const analyzeDiaperLogsFlow = ai.defineFlow<
  typeof AnalyzeDiaperLogsInputSchema,
  typeof AnalyzeDiaperLogsOutputSchema
>(
  {
    name: 'analyzeDiaperLogsFlow',
    inputSchema: AnalyzeDiaperLogsInputSchema,
    outputSchema: AnalyzeDiaperLogsOutputSchema,
  },
  async input => {
    const {output} = await analyzeDiaperLogsPrompt(input);
    return output!;
  }
);
