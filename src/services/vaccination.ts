/**
 * Represents a vaccination record.
 */
export interface VaccinationRecord {
  /**
   * The name of the vaccine.
   */
  vaccineName: string;
  /**
   * The date the vaccine was administered.
   */
  dateAdministered: string;
}

/**
 * Retrieves the recommended vaccination schedule based on the baby's age.
 *
 * @param babyAgeInMonths The age of the baby in months.
 * @returns A promise that resolves to an array of VaccinationRecord objects representing the recommended vaccination schedule.
 */
export async function getRecommendedVaccinations(
  babyAgeInMonths: number
): Promise<VaccinationRecord[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      vaccineName: 'Hepatitis B',
      dateAdministered: '2024-01-15',
    },
    {
      vaccineName: 'Rotavirus',
      dateAdministered: '2024-03-15',
    },
  ];
}
