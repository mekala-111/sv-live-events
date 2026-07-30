import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.chatMessage.deleteMany();
  await prisma.streamChatMessage.deleteMany();
  await prisma.streamMute.deleteMany();
  await prisma.streamAnalytic.deleteMany();
  await prisma.viewerSession.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.liveEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.extraService.deleteMany();
  await prisma.package.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const customerPassword = await bcrypt.hash('Customer@123', 12);
  const staffPassword = await bcrypt.hash('Staff@123', 12);
  const streamPassword = 'live1234';
  const streamPasswordHash = await bcrypt.hash(streamPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@svliveevents.com',
      password: adminPassword,
      name: 'SV Admin',
      phone: '+919876543210',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@svliveevents.com',
      password: customerPassword,
      name: 'Rajesh Kumar',
      phone: '+919876543211',
      role: 'CUSTOMER',
      customer: {
        create: {
          company: 'Kumar Events Pvt Ltd',
          address: '42 MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          gstNumber: '29ABCDE1234F1Z5',
        },
      },
    },
    include: { customer: true },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@svliveevents.com',
      password: staffPassword,
      name: 'Priya Sharma',
      phone: '+919876543212',
      role: 'STAFF',
    },
  });

  const packages = await Promise.all([
    prisma.package.create({
      data: {
        name: 'Silver',
        tier: 'SILVER',
        slug: 'silver',
        description: 'Perfect for intimate gatherings and small corporate events.',
        price: 24999,
        cameras: 2,
        durationHours: 4,
        features: JSON.stringify([
          '2 HD Cameras',
          '4 Hours Live Streaming',
          'Basic Graphics Overlay',
          'Recording Included',
          'Email Support',
        ]),
        sortOrder: 1,
      },
    }),
    prisma.package.create({
      data: {
        name: 'Gold',
        tier: 'GOLD',
        slug: 'gold',
        description: 'Our most popular package for weddings and medium-sized events.',
        price: 49999,
        cameras: 4,
        durationHours: 6,
        features: JSON.stringify([
          '4 HD Cameras',
          '6 Hours Live Streaming',
          'Custom Graphics & Lower Thirds',
          'Multi-platform Simulcast',
          'Dedicated Event Manager',
          'Recording + Highlights Reel',
        ]),
        isPopular: true,
        sortOrder: 2,
      },
    }),
    prisma.package.create({
      data: {
        name: 'Diamond',
        tier: 'DIAMOND',
        slug: 'diamond',
        description: 'Premium production for large-scale events and conferences.',
        price: 89999,
        cameras: 6,
        durationHours: 8,
        features: JSON.stringify([
          '6 4K Cameras',
          '8 Hours Live Streaming',
          'Professional Switching',
          'Virtual Stage & Backdrops',
          'Live Chat Moderation',
          'Same-day Edit Delivery',
        ]),
        sortOrder: 3,
      },
    }),
    prisma.package.create({
      data: {
        name: 'Enterprise',
        tier: 'ENTERPRISE',
        slug: 'enterprise',
        description: 'Fully customized solutions for enterprise and broadcast-grade events.',
        price: 149999,
        cameras: 8,
        durationHours: 12,
        features: JSON.stringify([
          '8+ 4K Cameras',
          '12 Hours Live Streaming',
          'Broadcast-grade Production',
          'Multi-venue Coverage',
          'Dedicated Technical Team',
          'Analytics Dashboard',
          'White-label Player',
        ]),
        sortOrder: 4,
      },
    }),
  ]);

  const extraServices = await Promise.all([
    prisma.extraService.create({
      data: {
        name: 'Drone Coverage',
        description: 'Aerial shots for stunning venue and crowd perspectives.',
        price: 15000,
        icon: 'drone',
      },
    }),
    prisma.extraService.create({
      data: {
        name: 'Extra Camera',
        description: 'Add an additional HD camera angle to your stream.',
        price: 8000,
        icon: 'camera',
      },
    }),
    prisma.extraService.create({
      data: {
        name: 'Highlight Reel',
        description: 'Professional 3-minute highlight video delivered within 48 hours.',
        price: 12000,
        icon: 'film',
      },
    }),
    prisma.extraService.create({
      data: {
        name: 'Live Chat Moderation',
        description: 'Dedicated moderator to manage audience chat during the event.',
        price: 5000,
        icon: 'chat',
      },
    }),
    prisma.extraService.create({
      data: {
        name: 'Multi-platform Simulcast',
        description: 'Stream simultaneously to YouTube, Facebook, and LinkedIn.',
        price: 7000,
        icon: 'broadcast',
      },
    }),
    prisma.extraService.create({
      data: {
        name: 'Virtual Background',
        description: 'Custom branded virtual stage and backdrop design.',
        price: 10000,
        icon: 'palette',
      },
    }),
  ]);

  const galleryItems = await Promise.all([
    prisma.galleryItem.create({
      data: {
        title: 'Grand Wedding Ceremony',
        category: 'Wedding',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
        description: 'Multi-camera live stream of a destination wedding in Udaipur.',
        isFeatured: true,
        sortOrder: 1,
      },
    }),
    prisma.galleryItem.create({
      data: {
        title: 'Tech Conference Keynote',
        category: 'Corporate',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        description: 'Hybrid conference with 5000+ virtual attendees.',
        isFeatured: true,
        sortOrder: 2,
      },
    }),
    prisma.galleryItem.create({
      data: {
        title: 'Music Festival Main Stage',
        category: 'Entertainment',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1459749411175-04bf8504ce77?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf8504ce77?w=400',
        description: 'Live broadcast from a 3-day music festival.',
        sortOrder: 3,
      },
    }),
    prisma.galleryItem.create({
      data: {
        title: 'Product Launch Event',
        category: 'Corporate',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',
        description: 'Global product launch with simulcast to 12 countries.',
        sortOrder: 4,
      },
    }),
    prisma.galleryItem.create({
      data: {
        title: 'Religious Ceremony',
        category: 'Spiritual',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1604881991720-f91add269051?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1604881991720-f91add269051?w=400',
        description: 'Live streaming a temple festival for diaspora families.',
        sortOrder: 5,
      },
    }),
    prisma.galleryItem.create({
      data: {
        title: 'Sports Tournament Finals',
        category: 'Sports',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1461896836934-ff607b08f947?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1461896836934-ff607b08f947?w=400',
        description: 'Multi-angle coverage of cricket tournament finals.',
        sortOrder: 6,
      },
    }),
    prisma.galleryItem.create({
      data: {
        title: 'Graduation Ceremony',
        category: 'Education',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
        description: 'Virtual graduation for families unable to attend in person.',
        sortOrder: 7,
      },
    }),
    prisma.galleryItem.create({
      data: {
        title: 'Fashion Show Runway',
        category: 'Fashion',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1558171814-005c8f9d8e03?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1558171814-005c8f9d8e03?w=400',
        description: 'Runway show streamed to international buyers.',
        isFeatured: true,
        sortOrder: 8,
      },
    }),
  ]);

  const testimonials = await Promise.all([
    prisma.testimonial.create({
      data: {
        name: 'Anita Desai',
        role: 'Event Manager',
        company: 'Desai Weddings',
        content:
          'SV Live Events transformed our wedding live stream. Crystal clear quality and seamless execution. Our guests abroad felt like they were right there with us.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Vikram Mehta',
        role: 'CEO',
        company: 'TechNova Solutions',
        content:
          'We streamed our annual conference to 8000 attendees globally. The production quality rivaled major broadcast networks. Highly recommended for corporate events.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Sneha Reddy',
        role: 'Marketing Director',
        company: 'BrandPulse India',
        content:
          'The team handled our product launch flawlessly. Multi-platform simulcast, professional graphics, and real-time analytics — everything we needed in one package.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Arjun Patel',
        role: 'Festival Organizer',
        company: 'SoundWave Events',
        content:
          'Three days of non-stop streaming with zero downtime. The crew was professional, responsive, and delivered beyond our expectations.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Meera Iyer',
        role: 'Temple Committee Head',
        company: 'Sri Venkateswara Temple',
        content:
          'Families across the world could participate in our festival celebrations thanks to SV Live Events. The spiritual moments were captured beautifully.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      },
    }),
  ]);

  const blogs = await Promise.all([
    prisma.blog.create({
      data: {
        title: '10 Tips for a Successful Virtual Wedding Live Stream',
        slug: 'virtual-wedding-live-stream-tips',
        excerpt: 'Make your virtual wedding guests feel truly present with these expert tips.',
        content:
          'Planning a virtual wedding component? Here are 10 essential tips to ensure your remote guests have an unforgettable experience. From camera placement to audio quality, we cover everything you need to know for a flawless live stream.',
        coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
        category: 'Weddings',
        authorId: admin.id,
      },
    }),
    prisma.blog.create({
      data: {
        title: 'How Hybrid Events Are Reshaping Corporate Conferences',
        slug: 'hybrid-events-corporate-conferences',
        excerpt: 'The future of corporate events is hybrid — here is why and how to get it right.',
        content:
          'Hybrid events combine the best of in-person and virtual experiences. Learn how leading companies are using live streaming to expand reach, reduce costs, and create more inclusive conferences.',
        coverImage: 'https://images.unsplash.com/photo-1505373877841-8d25f39c466e?w=800',
        category: 'Corporate',
        authorId: admin.id,
      },
    }),
    prisma.blog.create({
      data: {
        title: 'Choosing the Right Live Streaming Package for Your Event',
        slug: 'choosing-live-streaming-package',
        excerpt: 'Silver, Gold, Diamond, or Enterprise — which package fits your event?',
        content:
          'Not sure which SV Live Events package is right for you? This guide breaks down each tier by event size, duration, and production needs to help you make the perfect choice.',
        coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        category: 'Guides',
        authorId: admin.id,
      },
    }),
  ]);

  await prisma.coupon.createMany({
    data: [
      {
        code: 'SVLIVE10',
        description: '10% off on any package',
        discountType: 'percent',
        discountValue: 10,
        maxUses: 100,
      },
      {
        code: 'WELCOME500',
        description: 'Flat ₹500 off for new customers',
        discountType: 'flat',
        discountValue: 500,
        maxUses: 50,
      },
    ],
  });

  const goldPkg = packages[1];
  const silverPkg = packages[0];
  const customerProfile = customer.customer!;

  const subtotal1 = goldPkg.price;
  const tax1 = subtotal1 * 0.18;
  const total1 = subtotal1 + tax1;

  const booking1 = await prisma.booking.create({
    data: {
      bookingCode: 'SV-GOLD01',
      userId: customer.id,
      customerId: customerProfile.id,
      packageId: goldPkg.id,
      assignedStaffId: staff.id,
      eventType: 'Wedding',
      eventTitle: 'Kumar-Patel Wedding Ceremony',
      eventDate: new Date('2026-08-15T10:00:00Z'),
      eventEndDate: new Date('2026-08-15T18:00:00Z'),
      venue: 'The Leela Palace',
      city: 'Bangalore',
      expectedGuests: 350,
      subtotal: subtotal1,
      taxAmount: tax1,
      discountAmount: 0,
      totalAmount: total1,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      streamPassword,
      streamUrl: 'https://player.example.com/live/kumar-patel-wedding',
      invoice: {
        create: {
          invoiceNumber: 'INV-2026-10001',
          customerId: customerProfile.id,
          amount: subtotal1,
          taxAmount: tax1,
          totalAmount: total1,
          status: 'PAID',
          dueDate: new Date('2026-08-01T00:00:00Z'),
          paidAt: new Date(),
        },
      },
      payments: {
        create: {
          amount: total1,
          status: 'SUCCESS',
          provider: 'razorpay',
          razorpayOrderId: 'order_seed_001',
          razorpayPaymentId: 'pay_seed_001',
          method: 'upi',
        },
      },
      liveEvent: {
        create: {
          title: 'Kumar-Patel Wedding Ceremony',
          streamKey: 'stream_kumar_patel_wedding',
          embedUrl: 'https://player.example.com/live/stream_kumar_patel_wedding',
          isLive: true,
          viewerCount: 142,
          passwordHash: streamPasswordHash,
          startedAt: new Date(),
        },
      },
    },
    include: { liveEvent: true },
  });

  await prisma.chatMessage.createMany({
    data: [
      { bookingId: booking1.id, sender: 'Rajesh Kumar', message: 'Welcome everyone to our wedding live stream! 🎉', emoji: '🎉' },
      { bookingId: booking1.id, sender: 'Guest - Priya', message: 'Congratulations! Looking beautiful!', emoji: '❤️' },
      { bookingId: booking1.id, sender: 'Guest - Amit', message: 'Watching from London, wish I could be there!', emoji: '🙏' },
      { bookingId: booking1.id, sender: 'SV Live Team', message: 'Stream quality is excellent. Enjoy the ceremony!', emoji: '✨' },
    ],
  });

  const subtotal2 = silverPkg.price;
  const tax2 = subtotal2 * 0.18;
  const total2 = subtotal2 + tax2;

  await prisma.booking.create({
    data: {
      bookingCode: 'SV-SLV02',
      userId: customer.id,
      customerId: customerProfile.id,
      packageId: silverPkg.id,
      eventType: 'Corporate',
      eventTitle: 'Q3 Town Hall Meeting',
      eventDate: new Date('2026-09-20T14:00:00Z'),
      venue: 'TechNova HQ Auditorium',
      city: 'Bangalore',
      expectedGuests: 120,
      subtotal: subtotal2,
      taxAmount: tax2,
      discountAmount: 0,
      totalAmount: total2,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      streamPassword: 'townhall99',
      invoice: {
        create: {
          invoiceNumber: 'INV-2026-10002',
          customerId: customerProfile.id,
          amount: subtotal2,
          taxAmount: tax2,
          totalAmount: total2,
          status: 'DRAFT',
          dueDate: new Date('2026-09-10T00:00:00Z'),
        },
      },
      payments: {
        create: {
          amount: total2,
          status: 'PENDING',
          provider: 'razorpay',
        },
      },
      liveEvent: {
        create: {
          title: 'Q3 Town Hall Meeting',
          streamKey: 'stream_q3_townhall',
          embedUrl: 'https://player.example.com/live/stream_q3_townhall',
          passwordHash: await bcrypt.hash('townhall99', 12),
        },
      },
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        title: 'Booking Confirmed',
        message: 'Your Kumar-Patel Wedding booking (SV-GOLD01) has been confirmed.',
        type: 'success',
        link: '/dashboard/bookings',
      },
      {
        userId: customer.id,
        title: 'Payment Received',
        message: 'Payment of ₹58,998.82 received for booking SV-GOLD01.',
        type: 'info',
        link: '/dashboard/invoices',
      },
      {
        userId: customer.id,
        title: 'Live Stream Starting Soon',
        message: 'Your wedding live stream goes live in 2 hours. Stream password: live1234',
        type: 'warning',
        link: '/live',
      },
    ],
  });

  await prisma.setting.createMany({
    data: [
      { key: 'site_name', value: 'SV Live Events' },
      { key: 'contact_email', value: 'hello@svliveevents.com' },
      { key: 'contact_phone', value: '+91 98765 43210' },
      { key: 'gst_rate', value: '18' },
      { key: 'currency', value: 'INR' },
      { key: 'support_hours', value: 'Mon-Sat 9AM-7PM IST' },
    ],
  });

  const demoStreamPassword = 'Wedding@2027';
  const demoStream = await prisma.stream.create({
    data: {
      title: 'Rahul & Priya Wedding Live',
      slug: 'rahul-priya-wedding',
      eventType: 'Wedding',
      description: 'Private multi-camera wedding livestream for family worldwide.',
      rtmpUrl: 'rtmp://localhost:1935/live',
      streamKey: 'rahul_priya_2027',
      hlsUrl: 'http://localhost:8080/live/rahul_priya_2027.m3u8',
      webrtcUrl: 'webrtc://localhost:1985/live/rahul_priya_2027',
      passwordHash: await bcrypt.hash(demoStreamPassword, 12),
      status: 'LIVE',
      isRecording: true,
      ingestActive: true,
      publisherToken: 'pub_demo_rahul_priya',
      slowModeSec: 3,
      allowGifs: true,
      peakViewers: 842,
      currentViewers: 126,
      totalJoins: 1104,
      startedAt: new Date(),
      lastHeartbeatAt: new Date(),
      pinnedMessage: 'Welcome family — ceremony begins at 11:30 AM IST 🙏',
      createdById: admin.id,
    },
  });

  await prisma.streamChatMessage.createMany({
    data: [
      { streamId: demoStream.id, sender: 'Aunt Meera', message: 'The mandap looks divine!' },
      { streamId: demoStream.id, sender: 'Raj (USA)', message: 'Crystal clear from New Jersey 🇺🇸' },
      { streamId: demoStream.id, sender: 'Priya Cousin', message: '❤️❤️❤️', emoji: '❤️' },
    ],
  });

  await prisma.recording.create({
    data: {
      streamId: demoStream.id,
      title: 'Rahul & Priya — Ceremony Highlight',
      fileUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      previewUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      durationSec: 5400,
      fileSizeMb: 1200,
      isPublic: false,
      shareToken: 'rec_rahul_priya_demo',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      trimStartSec: 0,
      trimEndSec: 5400,
    },
  });

  console.log('Seed completed successfully!');
  console.log('\n--- Seed Credentials ---');
  console.log('Admin:    admin@svliveevents.com / Admin@123');
  console.log('Customer: customer@svliveevents.com / Customer@123');
  console.log('Staff:    staff@svliveevents.com / Staff@123');
  console.log('\n--- Private Live Stream ---');
  console.log('Viewer:   /live/rahul-priya-wedding');
  console.log('Password: Wedding@2027');
  console.log('RTMP:     rtmp://localhost:1935/live');
  console.log('Key:      rahul_priya_2027');
  console.log(`\nCreated ${packages.length} packages, ${extraServices.length} extras, ${galleryItems.length} gallery items`);
  console.log(`${testimonials.length} testimonials, ${blogs.length} blogs, 2 bookings, 1 live stream`);

  await prisma.subscriptionPlan.createMany({
    data: [
      {
        code: 'starter',
        name: 'Starter',
        monthlyPrice: 4999,
        yearlyPrice: 49990,
        maxStreams: 3,
        maxViewers: 200,
        maxStorageGb: 50,
        featuresJson: JSON.stringify(['1 brand', 'HLS', 'Chat']),
      },
      {
        code: 'business',
        name: 'Business',
        monthlyPrice: 14999,
        yearlyPrice: 149990,
        maxStreams: 20,
        maxViewers: 2000,
        maxStorageGb: 500,
        featuresJson: JSON.stringify(['Custom domain', 'Studio', 'AI highlights', 'Invites']),
      },
      {
        code: 'enterprise',
        name: 'Enterprise',
        monthlyPrice: 49999,
        yearlyPrice: 499990,
        maxStreams: 200,
        maxViewers: 50000,
        maxStorageGb: 5000,
        featuresJson: JSON.stringify(['Multi-tenant', 'DRM', 'SLA', 'White-label']),
      },
    ],
  });

  const business = await prisma.subscriptionPlan.findUnique({ where: { code: 'business' } });
  await prisma.tenant.create({
    data: {
      name: 'SV Live Events',
      slug: 'svlive',
      primaryColor: '#C9A14A',
      billingEmail: 'svliveevents@gmail.com',
      planId: business?.id,
      schemaKey: 'tenant_svlive',
      logoUrl: null,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
