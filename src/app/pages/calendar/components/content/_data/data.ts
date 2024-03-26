

export let roomData: Record<string, any>[] = [
    {
      Id: 1,
      Subject: 'Board Meeting',
      Description: 'Meeting to discuss business goal of 2021.',
      StartTime: new Date(5,3,2024),// if dates invalid, it doesnt paint the rooms
      EndTime: new Date(7,3,2024),
      RoomId: 1,
      ResourceId:1,
    //   IsBlock: true,
    //   RecurrenceRule: 'FREQ=DAILY;INTERVAL=1;',
    //IsAllDay: false,
    },
    
  ];

