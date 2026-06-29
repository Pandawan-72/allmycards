// Notifications simplifiées — exports vides pour compatibilité.
export async function requestNotificationPermission(): Promise<boolean> { return false; }
export async function scheduleExpirationAlert(_id: string, _name: string, _date: Date, _daysBefore: number): Promise<void> {}
export async function cancelExpirationAlert(_id: string): Promise<void> {}
