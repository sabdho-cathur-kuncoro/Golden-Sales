import { router } from "expo-router";
import dayjs, { formatDate } from "./days";

export const handleBack = (path: any) => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(path);
  }
};

export const wait = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

function groupedDays(messages: any) {
  return messages.reduce((acc: any, el: any, i: any) => {
    const messageDay = formatDate(el.created_at, "DD MMMM YYYY");
    if (acc[messageDay]) {
      return { ...acc, [messageDay]: acc[messageDay].concat([el]) };
    }
    return { ...acc, [messageDay]: [el] };
  }, {});
}

export function generateChat(messages: any) {
  const days = groupedDays(messages);
  const sortedDays = Object.keys(days).sort(
    (x, y) => dayjs(y, "DD MMMM YYYY").unix() - dayjs(x, "DD MMMM YYYY").unix()
  );
  const items = sortedDays.reduce<any[]>((acc, date) => {
    const sortedMessages = days[date].sort(
      (x: any, y: any) =>
        new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
    );
    return acc.concat([{ type: "day", date, id: date }, ...sortedMessages]);
  }, []);
  return items;
}
