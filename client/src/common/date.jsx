const month = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jan",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const day = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getDay = (timestamp) => {
  const date = new Date(timestamp);

  return `${date.getDate()} ${month[date.getMonth()]}`;
};
