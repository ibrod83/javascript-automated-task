export function getDateInTheFuture(secondsInTheFuture: number) {
    // Get the current date and time
    const now = new Date();
  
    // Add secondsInTheFuture to the current time
    const futureTime = now.getTime() + secondsInTheFuture * 1000;
  
    // Create a new Date object with the future time
    const futureDate = new Date(futureTime);
  
    // Return the future Date object
    return futureDate;
  }