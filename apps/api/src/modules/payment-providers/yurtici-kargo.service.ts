import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// =============================================================================
// YURTICI KARGO API TYPES
// =============================================================================

export interface YurticiAddress {
  name: string;
  phone: string;
  city: string;
  cityCode: string;
  district: string;
  districtCode?: string;
  address: string;
  zipCode?: string;
  email?: string;
}

export interface YurticiShipmentRequest {
  senderAddress: YurticiAddress;
  receiverAddress: YurticiAddress;
  weight: number; // kg
  width?: number; // cm
  height?: number; // cm
  length?: number; // cm
  productValue?: number; // TRY - for insurance
  paymentType: 'GONDERICIDEN' | 'ALICIDAN';
  serviceType: 'STANDART' | 'EXPRESS' | 'EKONOMIK';
  referenceNumber: string;
  description?: string;
  contentType?: 'BELGE' | 'MI' | 'PAKET'; // MI = Ticari Mal
  documentReturn?: boolean;
}

export interface YurticiShipmentResponse {
  success: boolean;
  cargoKey: string;
  trackingNumber: string;
  barcode: string;
  estimatedDeliveryDate: string;
  cost: number;
  labelUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface YurticiTrackingResponse {
  success: boolean;
  trackingNumber: string;
  status: string;
  statusCode: string;
  statusDate: string;
  events: Array<{
    date: string;
    time: string;
    status: string;
    statusCode: string;
    location: string;
    branchCode: string;
    description: string;
  }>;
  deliveredAt?: string;
  signedBy?: string;
  unitName?: string;
}

export interface YurticiRateResponse {
  success: boolean;
  rates: Array<{
    serviceType: string;
    serviceName: string;
    price: number;
    priceWithVat: number;
    estimatedDays: number;
    estimatedDeliveryDate: string;
  }>;
}

export interface YurticiBranch {
  code: string;
  name: string;
  address: string;
  city: string;
  district: string;
  phone: string;
  fax?: string;
  workingHours: string;
  latitude?: number;
  longitude?: number;
  isPickupPoint: boolean;
}

// =============================================================================
// YURTICI KARGO SERVICE
// =============================================================================

@Injectable()
export class YurticiKargoService {
  private readonly logger = new Logger(YurticiKargoService.name);
  private readonly username: string;
  private readonly password: string;
  private readonly customerCode: string;
  private readonly baseUrl: string;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    this.username = this.configService.get('YURTICI_KARGO_USERNAME', '');
    this.password = this.configService.get('YURTICI_KARGO_PASSWORD', '');
    this.customerCode = this.configService.get('YURTICI_KARGO_CUSTOMER_CODE', '');
    this.baseUrl = this.configService.get(
      'YURTICI_KARGO_API_URL',
      'https://ws.yurticikargo.com',
    );

    this.isConfigured = !!(this.username && this.password && this.customerCode);

    if (!this.isConfigured) {
      this.logger.warn('⚠️ Yurtiçi Kargo API credentials not configured');
    } else {
      this.logger.log('✅ Yurtiçi Kargo service initialized');
    }
  }

  /**
   * Check if service is configured
   */
  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  // ==========================================================================
  // SHIPMENT CREATION
  // ==========================================================================

  /**
   * Create shipment
   */
  async createShipment(request: YurticiShipmentRequest): Promise<YurticiShipmentResponse> {
    // In production, this would call the actual Yurtiçi Kargo SOAP API
    // Yurtiçi uses SOAP web services at: https://ws.yurticikargo.com/KargoTakipService.wsdl

    try {
      const cargoKey = this.generateCargoKey();
      const trackingNumber = this.generateTrackingNumber();
      const barcode = `YK${trackingNumber}`;

      // Calculate estimated delivery based on service type
      const deliveryDays = this.calculateDeliveryDays(
        request.senderAddress.city,
        request.receiverAddress.city,
        request.serviceType,
      );
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);

      // Calculate cost
      const cost = this.calculateShippingCost(request);

      this.logger.log(`📦 Yurtiçi Kargo shipment created: ${trackingNumber}`, {
        from: `${request.senderAddress.city}/${request.senderAddress.district}`,
        to: `${request.receiverAddress.city}/${request.receiverAddress.district}`,
        weight: request.weight,
        serviceType: request.serviceType,
        cost,
      });

      return {
        success: true,
        cargoKey,
        trackingNumber,
        barcode,
        estimatedDeliveryDate: estimatedDelivery.toISOString(),
        cost,
        labelUrl: `https://ws.yurticikargo.com/etiket/${barcode}`,
      };
    } catch (error: any) {
      this.logger.error('Yurtiçi Kargo shipment creation failed:', error);
      return {
        success: false,
        cargoKey: '',
        trackingNumber: '',
        barcode: '',
        estimatedDeliveryDate: '',
        cost: 0,
        errorCode: 'CREATE_FAILED',
        errorMessage: error.message || 'Kargo oluşturulamadı',
      };
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(cargoKey: string): Promise<boolean> {
    // In production, this would call the actual API
    this.logger.log(`📦 Yurtiçi Kargo shipment cancelled: ${cargoKey}`);
    return true;
  }

  /**
   * Create return shipment
   */
  async createReturnShipment(
    originalTrackingNumber: string,
    reason: string,
  ): Promise<YurticiShipmentResponse> {
    // In production, call the return shipment API
    const returnTrackingNumber = `R${this.generateTrackingNumber()}`;

    this.logger.log(`📦 Yurtiçi Kargo return shipment created: ${returnTrackingNumber}`);

    return {
      success: true,
      cargoKey: this.generateCargoKey(),
      trackingNumber: returnTrackingNumber,
      barcode: `YKR${returnTrackingNumber}`,
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      cost: 0, // Return shipping usually free or charged differently
    };
  }

  // ==========================================================================
  // TRACKING
  // ==========================================================================

  /**
   * Get tracking info by tracking number
   */
  async getTrackingInfo(trackingNumber: string): Promise<YurticiTrackingResponse> {
    // In production, this would call the actual Yurtiçi Kargo tracking API
    const events = this.generateTrackingEvents(trackingNumber);
    const lastEvent = events[events.length - 1];

    return {
      success: true,
      trackingNumber,
      status: lastEvent.status,
      statusCode: lastEvent.statusCode,
      statusDate: `${lastEvent.date} ${lastEvent.time}`,
      events,
      deliveredAt: lastEvent.statusCode === 'DELIVERED' 
        ? `${lastEvent.date} ${lastEvent.time}` 
        : undefined,
    };
  }

  /**
   * Get tracking info by cargo key
   */
  async getTrackingByCargoKey(cargoKey: string): Promise<YurticiTrackingResponse> {
    // Convert cargo key to tracking number (in production, this would be a separate API call)
    return this.getTrackingInfo(cargoKey);
  }

  /**
   * Get multiple tracking info
   */
  async getMultipleTrackingInfo(
    trackingNumbers: string[],
  ): Promise<Record<string, YurticiTrackingResponse>> {
    const results: Record<string, YurticiTrackingResponse> = {};

    for (const trackingNumber of trackingNumbers) {
      results[trackingNumber] = await this.getTrackingInfo(trackingNumber);
    }

    return results;
  }

  // ==========================================================================
  // RATE CALCULATION
  // ==========================================================================

  /**
   * Get shipping rates
   */
  async getRates(
    senderCity: string,
    receiverCity: string,
    weight: number,
    dimensions?: { width: number; height: number; length: number },
  ): Promise<YurticiRateResponse> {
    // Calculate volumetric weight (desi)
    let desiWeight = weight;
    if (dimensions) {
      desiWeight = (dimensions.width * dimensions.height * dimensions.length) / 3000;
    }

    const billableWeight = Math.max(weight, desiWeight);
    const baseCost = this.calculateBaseCost(senderCity, receiverCity);
    const weightCost = this.calculateWeightCost(billableWeight);

    const standardPrice = baseCost + weightCost;
    const expressPrice = standardPrice * 1.4;
    const economicPrice = standardPrice * 0.85;

    const today = new Date();
    const standardDays = this.calculateDeliveryDays(senderCity, receiverCity, 'STANDART');
    const expressDays = this.calculateDeliveryDays(senderCity, receiverCity, 'EXPRESS');
    const economicDays = this.calculateDeliveryDays(senderCity, receiverCity, 'EKONOMIK');

    return {
      success: true,
      rates: [
        {
          serviceType: 'EKONOMIK',
          serviceName: 'Ekonomik Teslimat',
          price: Math.round(economicPrice * 100) / 100,
          priceWithVat: Math.round(economicPrice * 1.18 * 100) / 100,
          estimatedDays: economicDays,
          estimatedDeliveryDate: new Date(today.getTime() + economicDays * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          serviceType: 'STANDART',
          serviceName: 'Standart Teslimat',
          price: Math.round(standardPrice * 100) / 100,
          priceWithVat: Math.round(standardPrice * 1.18 * 100) / 100,
          estimatedDays: standardDays,
          estimatedDeliveryDate: new Date(today.getTime() + standardDays * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          serviceType: 'EXPRESS',
          serviceName: 'Hızlı Teslimat (Ertesi Gün)',
          price: Math.round(expressPrice * 100) / 100,
          priceWithVat: Math.round(expressPrice * 1.18 * 100) / 100,
          estimatedDays: expressDays,
          estimatedDeliveryDate: new Date(today.getTime() + expressDays * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    };
  }

  // ==========================================================================
  // BRANCH/PICKUP POINTS
  // ==========================================================================

  /**
   * Get branches by city
   */
  async getBranchesByCity(cityCode: string): Promise<YurticiBranch[]> {
    // In production, this would call the actual API
    return [
      {
        code: 'YK340001',
        name: 'Kadıköy Şubesi',
        address: 'Caferağa Mah. Moda Cad. No:45, Kadıköy',
        city: 'İstanbul',
        district: 'Kadıköy',
        phone: '0216 345 6789',
        workingHours: '08:30 - 19:00',
        isPickupPoint: true,
      },
      {
        code: 'YK340002',
        name: 'Üsküdar Şubesi',
        address: 'Mimar Sinan Mah. Hakimiyet-i Milliye Cad. No:78, Üsküdar',
        city: 'İstanbul',
        district: 'Üsküdar',
        phone: '0216 456 7890',
        workingHours: '08:30 - 19:00',
        isPickupPoint: true,
      },
    ];
  }

  /**
   * Get nearest pickup points
   */
  async getNearestPickupPoints(
    latitude: number,
    longitude: number,
    limit: number = 5,
  ): Promise<YurticiBranch[]> {
    // In production, this would use geolocation API
    return this.getBranchesByCity('34'); // Default to Istanbul
  }

  // ==========================================================================
  // CITY/DISTRICT LOOKUP
  // ==========================================================================

  /**
   * Get all cities
   */
  async getCities(): Promise<Array<{ code: string; name: string }>> {
    // Turkish cities with their codes
    return [
      { code: '01', name: 'Adana' },
      { code: '06', name: 'Ankara' },
      { code: '07', name: 'Antalya' },
      { code: '16', name: 'Bursa' },
      { code: '34', name: 'İstanbul' },
      { code: '35', name: 'İzmir' },
      { code: '41', name: 'Kocaeli' },
      // ... more cities would be included in production
    ];
  }

  /**
   * Get districts by city
   */
  async getDistrictsByCity(
    cityCode: string,
  ): Promise<Array<{ code: string; name: string }>> {
    // Sample districts for Istanbul
    if (cityCode === '34') {
      return [
        { code: '3401', name: 'Kadıköy' },
        { code: '3402', name: 'Beşiktaş' },
        { code: '3403', name: 'Üsküdar' },
        { code: '3404', name: 'Şişli' },
        // ... more districts
      ];
    }
    return [];
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Generate cargo key
   */
  private generateCargoKey(): string {
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CK${timestamp}${random}`;
  }

  /**
   * Generate tracking number
   */
  private generateTrackingNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`;
  }

  /**
   * Calculate shipping cost
   */
  private calculateShippingCost(request: YurticiShipmentRequest): number {
    const baseCost = this.calculateBaseCost(
      request.senderAddress.city,
      request.receiverAddress.city,
    );

    // Calculate volumetric weight
    let billableWeight = request.weight;
    if (request.width && request.height && request.length) {
      const desiWeight = (request.width * request.height * request.length) / 3000;
      billableWeight = Math.max(request.weight, desiWeight);
    }

    const weightCost = this.calculateWeightCost(billableWeight);
    let totalCost = baseCost + weightCost;

    // Apply service type multiplier
    if (request.serviceType === 'EXPRESS') {
      totalCost *= 1.4;
    } else if (request.serviceType === 'EKONOMIK') {
      totalCost *= 0.85;
    }

    return Math.round(totalCost * 100) / 100;
  }

  /**
   * Calculate base cost by route
   */
  private calculateBaseCost(senderCity: string, receiverCity: string): number {
    const senderLower = senderCity.toLowerCase();
    const receiverLower = receiverCity.toLowerCase();

    // Same city
    if (senderLower === receiverLower) {
      return 22;
    }

    // Major city routes
    const majorCities = ['istanbul', 'ankara', 'izmir', 'antalya', 'bursa', 'kocaeli'];
    const isMajorRoute = majorCities.includes(senderLower) && majorCities.includes(receiverLower);

    if (isMajorRoute) {
      return 32;
    }

    // Default inter-city
    return 42;
  }

  /**
   * Calculate weight cost
   */
  private calculateWeightCost(weight: number): number {
    if (weight <= 1) return 0;
    if (weight <= 3) return (weight - 1) * 4;
    if (weight <= 5) return 8 + (weight - 3) * 3.5;
    if (weight <= 10) return 15 + (weight - 5) * 3;
    if (weight <= 20) return 30 + (weight - 10) * 2.5;
    if (weight <= 30) return 55 + (weight - 20) * 2;
    return 75 + (weight - 30) * 1.8;
  }

  /**
   * Calculate delivery days
   */
  private calculateDeliveryDays(
    senderCity: string,
    receiverCity: string,
    serviceType: string,
  ): number {
    let baseDays: number;
    const senderLower = senderCity.toLowerCase();
    const receiverLower = receiverCity.toLowerCase();

    // Same city
    if (senderLower === receiverLower) {
      baseDays = 1;
    } else {
      // Major cities
      const majorCities = ['istanbul', 'ankara', 'izmir', 'antalya', 'bursa'];
      if (majorCities.includes(senderLower) && majorCities.includes(receiverLower)) {
        baseDays = 2;
      } else {
        baseDays = 3;
      }
    }

    // Adjust for service type
    if (serviceType === 'EXPRESS') {
      return Math.max(1, baseDays - 1);
    } else if (serviceType === 'EKONOMIK') {
      return baseDays + 1;
    }

    return baseDays;
  }

  /**
   * Generate tracking events
   */
  private generateTrackingEvents(
    trackingNumber: string,
  ): Array<{
    date: string;
    time: string;
    status: string;
    statusCode: string;
    location: string;
    branchCode: string;
    description: string;
  }> {
    const now = new Date();
    const events = [];

    // Kargo kabul
    const created = new Date(now);
    created.setHours(created.getHours() - 48);
    events.push({
      date: created.toISOString().split('T')[0],
      time: '15:20',
      status: 'Kargo Kabul',
      statusCode: 'ACCEPTED',
      location: 'İstanbul Anadolu Transfer',
      branchCode: 'YK340001',
      description: 'Kargo şubeden kabul edildi',
    });

    // Çıkış yapıldı
    const departed = new Date(now);
    departed.setHours(departed.getHours() - 36);
    events.push({
      date: departed.toISOString().split('T')[0],
      time: '22:45',
      status: 'Çıkış Yapıldı',
      statusCode: 'DEPARTED',
      location: 'İstanbul Anadolu Transfer',
      branchCode: 'YK340001',
      description: 'Kargo transfer merkezine gönderildi',
    });

    // Transfer merkezinde
    const inTransit = new Date(now);
    inTransit.setHours(inTransit.getHours() - 24);
    events.push({
      date: inTransit.toISOString().split('T')[0],
      time: '06:30',
      status: 'Transfer Merkezinde',
      statusCode: 'IN_TRANSIT',
      location: 'İstanbul Ana Transfer Merkezi',
      branchCode: 'YK340000',
      description: 'Kargo ana transfer merkezine ulaştı',
    });

    // Dağıtıma çıktı
    events.push({
      date: now.toISOString().split('T')[0],
      time: '08:15',
      status: 'Dağıtıma Çıktı',
      statusCode: 'OUT_FOR_DELIVERY',
      location: 'Kadıköy Şubesi',
      branchCode: 'YK340001',
      description: 'Kargo dağıtıma çıkarıldı',
    });

    return events;
  }

  // ==========================================================================
  // CONVENIENCE METHODS
  // ==========================================================================

  /**
   * Create shipment for order (simplified interface)
   */
  async createShipmentForOrder(
    orderId: string,
    sender: {
      name: string;
      phone: string;
      city: string;
      district: string;
      address: string;
    },
    receiver: {
      name: string;
      phone: string;
      city: string;
      district: string;
      address: string;
    },
    packageInfo: {
      weight: number;
      description: string;
      value?: number;
    },
  ): Promise<YurticiShipmentResponse> {
    return this.createShipment({
      senderAddress: {
        name: sender.name,
        phone: sender.phone,
        city: sender.city,
        cityCode: '', // Would be resolved in production
        district: sender.district,
        address: sender.address,
      },
      receiverAddress: {
        name: receiver.name,
        phone: receiver.phone,
        city: receiver.city,
        cityCode: '', // Would be resolved in production
        district: receiver.district,
        address: receiver.address,
      },
      weight: packageInfo.weight,
      productValue: packageInfo.value,
      paymentType: 'GONDERICIDEN',
      serviceType: 'STANDART',
      referenceNumber: orderId,
      description: packageInfo.description,
      contentType: 'PAKET',
    });
  }
}
