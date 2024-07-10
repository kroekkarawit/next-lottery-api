const { PrismaClient, Status } = require("@prisma/client");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
 
dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();
const timeZone = 'Asia/Bangkok';

const parseTime = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(':');
  return dayjs().tz(timeZone).hour(hours).minute(minutes).second(seconds).millisecond(0).toDate();
};

const parseDateTime = (dateTimeString) => {
  return dayjs.tz(dateTimeString, timeZone).toDate();
};

async function main() {
  await prisma.lottery.createMany({
    data: [
      {
        id: 1,
        type: 'MAGNUM',
        code: 'M',
        detail: JSON.stringify({
          name: 'Magnum',
          flag: 'https://coba8.com/images/mag2.gif',
          color: '#ffff00'
        }),
        open_before: 7,
        open_time: parseTime('00:30:00'),
        close_weekday: JSON.stringify([2, 5, 6]),
        close_extra: JSON.stringify([]),
        off_holiday: JSON.stringify([]),
        close_after: 0,
        close_time: parseTime('19:00:00'),
        result_after: 0,
        result_time: parseTime('21:30:00'),
        status: 'ACTIVE',
        updated_at: parseDateTime('2024-06-30T18:09:49.858'),
        created_at: parseDateTime('2024-05-18T12:56:38.691')
      },
      {
        id: 2,
        type: 'PMP',
        code: 'P',
        detail: JSON.stringify({
          name: 'PMP',
          flag: 'https://coba8.com/images/pmp2.gif',
          color: '#0000ff'
        }),
        open_before: 7,
        open_time: parseTime('00:30:00'),
        close_weekday: JSON.stringify([2, 5, 6]),
        close_extra: JSON.stringify([]),
        off_holiday: JSON.stringify([]),
        close_after: 0,
        close_time: parseTime('19:00:00'),
        result_after: 0,
        result_time: parseTime('21:30:00'),
        status: 'ACTIVE',
        updated_at: parseDateTime('2024-06-30T18:09:53.259'),
        created_at: parseDateTime('2024-05-18T12:56:38.691')
      },
      {
        id: 3,
        type: 'TOTO',
        code: 'T',
        detail: JSON.stringify({
          name: 'TOTO',
          flag: 'https://coba8.com/images/tot2.gif',
          color: '#cc0000'
        }),
        open_before: 7,
        open_time: parseTime('00:30:00'),
        close_weekday: JSON.stringify([2, 5, 6]),
        close_extra: JSON.stringify([]),
        off_holiday: JSON.stringify([]),
        close_after: 0,
        close_time: parseTime('19:00:00'),
        result_after: 0,
        result_time: parseTime('20:00:00'),
        status: 'ACTIVE',
        updated_at: parseDateTime('2024-05-18T12:56:38.691'),
        created_at: parseDateTime('2024-05-18T12:56:38.691')
      },
      {
        id: 4,
        type: 'SINGAPORE',
        code: 'S',
        detail: JSON.stringify({
          name: 'SINGAPORE',
          flag: 'https://coba8.com/images/sin2.gif',
          color: '#4C8ED1'
        }),
        open_before: 7,
        open_time: parseTime('00:30:00'),
        close_weekday: JSON.stringify([2, 5, 6]),
        close_extra: JSON.stringify([]),
        off_holiday: JSON.stringify([]),
        close_after: 0,
        close_time: parseTime('19:00:00'),
        result_after: 0,
        result_time: parseTime('20:00:00'),
        status: 'ACTIVE',
        updated_at: parseDateTime('2024-05-18T12:56:38.691'),
        created_at: parseDateTime('2024-05-18T12:56:38.691')
      },
      {
        id: 5,
        type: 'SABAH',
        code: 'B',
        detail: JSON.stringify({
          name: 'SABAH',
          flag: 'https://coba8.com/images/sab2.gif',
          color: '#E51D20'
        }),
        open_before: 7,
        open_time: parseTime('00:30:00'),
        close_weekday: JSON.stringify([2, 5, 6]),
        close_extra: JSON.stringify([]),
        off_holiday: JSON.stringify([]),
        close_after: 0,
        close_time: parseTime('19:00:00'),
        result_after: 0,
        result_time: parseTime('20:00:00'),
        status: 'ACTIVE',
        updated_at: parseDateTime('2024-05-18T12:56:38.691'),
        created_at: parseDateTime('2024-05-18T12:56:38.691')
      },
      {
        id: 6,
        type: 'SANDAKAN',
        code: 'K',
        detail: JSON.stringify({
          name: 'SANDAKAN',
          flag: 'https://coba8.com/images/san2.gif',
          color: '#E51D20'
        }),
        open_before: 7,
        open_time: parseTime('00:30:00'),
        close_weekday: JSON.stringify([2, 5, 6]),
        close_extra: JSON.stringify([]),
        off_holiday: JSON.stringify([]),
        close_after: 0,
        close_time: parseTime('19:00:00'),
        result_after: 0,
        result_time: parseTime('20:00:00'),
        status: 'ACTIVE',
        updated_at: parseDateTime('2024-05-18T12:56:38.691'),
        created_at: parseDateTime('2024-05-18T12:56:38.691')
      },
      {
        id: 7,
        type: 'SARAWAK',
        code: 'W',
        detail: JSON.stringify({
          name: 'SARAWAK',
          flag: 'https://coba8.com/images/sar2.gif',
          color: '#00540E'
        }),
        open_before: 7,
        open_time: parseTime('00:30:00'),
        close_weekday: JSON.stringify([2, 5, 6]),
        close_extra: JSON.stringify([]),
        off_holiday: JSON.stringify([]),
        close_after: 0,
        close_time: parseTime('19:00:00'),
        result_after: 0,
        result_time: parseTime('20:00:00'),
        status: 'ACTIVE',
        updated_at: parseDateTime('2024-05-18T12:56:38.691'),
        created_at: parseDateTime('2024-05-18T12:56:38.691')
      },
      {
        id: 8,
        type: 'GD LOTTO',
        code: 'H',
        detail: JSON.stringify({
          name: 'GD LOTTO',
          flag: 'https://coba8.com/images/gd.jpg',
          color: '#ffd700'
        }),
        open_before: 7,
        open_time: parseTime('00:30:00'),
        close_weekday: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
        close_extra: JSON.stringify([]),
        off_holiday: JSON.stringify([]),
        close_after: 0,
        close_time: parseTime('19:00:00'),
        result_after: 0,
        result_time: parseTime('20:00:00'),
        status: 'ACTIVE',
        updated_at: parseDateTime('2024-05-18T12:56:38.691'),
        created_at: parseDateTime('2024-05-18T12:56:38.691')
      },
      {
        id: 9,
        type: '9LOTTO',
        code: 'E',
        detail: JSON.stringify({
          name: '9 LOTTO',
          flag: 'https://coba8.com/images/9lotto.png',
          color: '#ffa500'
        }),
        open_before: 7,
        open_time: parseTime('00:30:00'),
        close_weekday: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
        close_extra: JSON.stringify([]),
        off_holiday: JSON.stringify([]),
        close_after: 0,
        close_time: parseTime('19:00:00'),
        result_after: 0,
        result_time: parseTime('20:00:00'),
        status: 'ACTIVE',
        updated_at: parseDateTime('2024-05-18T12:56:38.691'),
        created_at: parseDateTime('2024-05-18T12:56:38.691')
      },
      {
        id: 10,
        type: 'GOVERNMENT TH',
        code: 'TH',
        detail: JSON.stringify({
          name: 'Thai Lottery',
          flag: '',
          color: '#ffff00'
        }),
        open_before: 12,
        open_time: parseTime('01:00:00'),
        close_weekday: JSON.stringify([]),
        close_extra: JSON.stringify(["01-07-2024", "16-07-2024"]),
        off_holiday: JSON.stringify([]),
        close_after: 0,
        close_time: parseTime('14:30:00'),
        result_after: 0,
        result_time: parseTime('21:30:00'),
        status: 'ACTIVE',
        updated_at: parseDateTime('2024-06-23T19:43:18.599'),
        created_at: parseDateTime('2024-06-21T14:17:38.902')
      }
    ]
  });

  console.log('Seed data inserted');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });