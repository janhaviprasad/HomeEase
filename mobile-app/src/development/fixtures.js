export const previewUser = {
  name: 'Samruddhi',
  fullName: 'Samruddhi K.',
  email: 'samruddhi@example.com',
  phone: '+91 90000 00002',
};

export const providerUser = {
  name: 'Alex Johnson',
  email: 'alex.provider@example.com',
  phone: '+91 90000 00004',
};

export const providerProfile = {
  categoryName: 'Electrician',
  experience: 5,
  rating: 4.9,
  isApproved: true,
  availability: true,
};

export const services = [
  {
    id: 1,
    name: 'Electrician',
    description: 'Wiring, repairs, and installations by certified professionals.',
    price: 299,
  },
  {
    id: 2,
    name: 'Plumbing',
    description: 'Leak fixes, pipe installations, and general plumbing maintenance.',
    price: 199,
  },
  {
    id: 3,
    name: 'Cleaning',
    description: 'Deep cleaning, regular maintenance, and move-in/out services.',
    price: 149,
  },
  {
    id: 4,
    name: 'AC Service',
    description: 'Cooling, filter cleaning, and seasonal maintenance.',
    price: 499,
  },
];

export const bookings = [
  {
    id: 7,
    serviceName: 'Electrician',
    bookingDate: '2026-06-20T10:00:00+05:30',
    status: 'PENDING',
    address: '14 MG Road, Indore',
    totalPrice: 299,
    provider: null,
    canReview: false,
  },
  {
    id: 8,
    serviceName: 'Plumbing',
    bookingDate: '2026-06-18T11:00:00+05:30',
    status: 'ACCEPTED',
    address: '12 MG Road, Pune',
    totalPrice: 199,
    provider: {
      name: 'Alex Johnson',
      rating: 4.9,
      phone: '+91 90000 00004',
    },
    canReview: false,
  },
  {
    id: 9,
    serviceName: 'Cleaning',
    bookingDate: '2026-06-12T14:00:00+05:30',
    status: 'COMPLETED',
    address: '8 Residency Road, Pune',
    totalPrice: 149,
    provider: {
      name: 'Jane Provider',
      rating: 4.8,
      phone: '+91 90000 00005',
    },
    canReview: true,
  },
];

export const availableJobs = [
  {
    id: 21,
    serviceName: 'Electrical Repair',
    location: 'Indore',
    bookingDate: '2026-10-24T10:00:00+05:30',
    totalPrice: 299,
  },
  {
    id: 22,
    serviceName: 'Switchboard Installation',
    location: 'Pune',
    bookingDate: '2026-10-25T14:00:00+05:30',
    totalPrice: 349,
  },
];

export const assignedJobs = [
  {
    id: 31,
    serviceName: 'Emergency Pipe Leak',
    bookingDate: '2026-10-24T10:30:00+05:30',
    status: 'IN_PROGRESS',
    address: '124 Maple Street, Apt 4B',
    totalPrice: 120,
    customer: 'Samruddhi K.',
    phone: '+91 90000 00002',
  },
  {
    id: 32,
    serviceName: 'Fan Repair',
    bookingDate: '2026-10-25T09:00:00+05:30',
    status: 'ACCEPTED',
    address: '18 Lake View Road, Pune',
    totalPrice: 220,
    customer: 'Riya Sharma',
    phone: '+91 90000 00003',
  },
];
