const API_URL = 'http://localhost:3000/api';

const endpoints = {
  download: {},
  filter: {},
  upload: {},
  database: {},
};

endpoints.filter.dates = `${API_URL}/data/dateFilter`;
endpoints.filter.rooms = `${API_URL}/data/roomFilter`;
endpoints.filter.sessions = `${API_URL}/data/sessionFilter`;
endpoints.upload.session = `${API_URL}/data/UnscheduledSession`;
endpoints.upload.sessions = `${API_URL}/data/UnscheduledSessions`;
endpoints.allRooms = `${API_URL}/data/HotelRooms`;
endpoints.uploadAll = `${API_URL}/data/uploadAll`;

endpoints.hotels = `${API_URL}/data/hotels`;
endpoints.roomHotelOptions = `${API_URL}/data/roomHotelOptions`;
endpoints.avOptions = `${API_URL}/data/avOptions`;
endpoints.storeScheduleSessions = `${API_URL}/data/storeScheduleSessions`;
endpoints.getConferenceTimes = `${API_URL}/data/getConferenceTimes`;
endpoints.sessionFilterOptions = `${API_URL}/data/sessionFilterOptions`;
endpoints.conferenceTimes = `${API_URL}/data/conferenceTimes`;
endpoints.purgeDb = `${API_URL}/data/purgeDB`;
endpoints.outputSchedule = `${API_URL}/data/getScheduleDisplay`;
endpoints.switchDb = `${API_URL}/data/switchDbData`;

endpoints.database.date = 'Date';
endpoints.database.schedule = 'Scheduled';
endpoints.database.unschedule = 'Unscheduled';
endpoints.database.hotel = 'Hotel';
endpoints.database.speaker = 'Speaker';
endpoints.database.all = 'All';

export default endpoints;
