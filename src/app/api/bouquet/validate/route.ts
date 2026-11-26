import { NextResponse } from 'next/server';
import { db } from '../../../../lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sheetId, sizeId, decorationIds, items } = body as {
      sheetId: string;
      sizeId?: string;
      decorationIds?: string[];
      items: { id: string; quantity: number }[];
    };

    if (!sheetId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { valid: false, error: 'Please choose a wrapping sheet and at least one item.' },
        { status: 400 }
      );
    }

    // 1. Fetch live sheets, bouquet items, sizes, decorations and settings
    const [sheets, bItems, bouquetSizes, dbDecorations, settings] = await Promise.all([
      db.getWrappingSheets(),
      db.getBouquetItems(),
      db.getBouquetSizes(),
      db.getDecorations(),
      db.getSettings(),
    ]);

    // Check if feature is enabled
    if (settings?.builderSettings?.builderEnabled === false) {
      return NextResponse.json(
        { valid: false, error: 'Custom bouquet builder is currently paused by studio.' },
        { status: 400 }
      );
    }

    // Validate size
    let chosenSize = bouquetSizes.find((s) => s.id === sizeId);
    if (!chosenSize) {
      chosenSize = bouquetSizes[0] || {
        id: 'size-md',
        name: 'Classic Bouquet (Medium)',
        maxPieces: settings?.builderSettings?.maxPieces || 12,
        baseCharge: 0,
      };
    }

    const maxPieces = chosenSize.maxPieces || settings?.builderSettings?.maxPieces || 12;

    // 2. Validate sheet
    const sheet = sheets.find((s) => s.id === sheetId);
    if (!sheet) {
      return NextResponse.json(
        { valid: false, error: 'Selected wrapping sheet is no longer available.' },
        { status: 400 }
      );
    }

    if (sheet.stock <= 0) {
      return NextResponse.json(
        { valid: false, error: `The wrapping sheet "${sheet.name}" just sold out! Please select another sheet.` },
        { status: 400 }
      );
    }

    // 3. Validate items & compute server price
    let totalPieces = 0;
    let computedPrice = sheet.price + (chosenSize.baseCharge || 0);
    const validatedItems: Array<{
        id: string;
        name: string;
        unitPrice: number;
        quantity: number;
        subtotal: number;
      }> = [];

    for (const reqItem of items) {
      if (reqItem.quantity <= 0) continue;
      totalPieces += reqItem.quantity;

      const item = bItems.find((b) => b.id === reqItem.id);
      if (!item) {
        return NextResponse.json(
          { valid: false, error: `One of your selected bouquet items is no longer available.` },
          { status: 400 }
        );
      }

      if (item.stock < reqItem.quantity) {
        return NextResponse.json(
          {
            valid: false,
            error: `"${item.name}" only has ${item.stock} in stock (you requested ${reqItem.quantity}). Please adjust quantity.`,
          },
          { status: 400 }
        );
      }

      computedPrice += item.price * reqItem.quantity;
      validatedItems.push({
        id: item.id,
        name: item.name,
        unitPrice: item.price,
        quantity: reqItem.quantity,
        subtotal: item.price * reqItem.quantity,
      });
    }

    if (totalPieces > maxPieces) {
      return NextResponse.json(
        { valid: false, error: `Bouquet exceeds maximum limit of ${maxPieces} pieces for ${chosenSize.name}.` },
        { status: 400 }
      );
    }

    // 4. Validate decorations
    const validatedDecorations: Array<{
      id: string;
      name: string;
      price: number;
    }> = [];
    if (Array.isArray(decorationIds) && decorationIds.length > 0) {
      for (const decId of decorationIds) {
        const dec = dbDecorations.find((d) => d.id === decId);
        if (dec && dec.isActive !== false) {
          computedPrice += dec.price;
          validatedDecorations.push({
            id: dec.id,
            name: dec.name,
            price: dec.price,
          });
        }
      }
    }

    return NextResponse.json({
      valid: true,
      recomputedTotal: computedPrice,
      sheet: {
        id: sheet.id,
        name: sheet.name,
        price: sheet.price,
      },
      size: {
        id: chosenSize.id,
        name: chosenSize.name,
        maxPieces: chosenSize.maxPieces,
        baseCharge: chosenSize.baseCharge,
      },
      decorations: validatedDecorations,
      items: validatedItems,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { valid: false, error: 'Server validation error: ' + msg },
      { status: 500 }
    );
  }
}
