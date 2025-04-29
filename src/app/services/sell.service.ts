import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, tap, switchMap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { CardSubmission, CardCondition, CardRarity, SubmissionStatus } from '../models/card-submission.model';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class SellService {
  private submissions: CardSubmission[] = [];
  private submissionsSubject = new BehaviorSubject<CardSubmission[]>([]);
  private isBrowser: boolean;
  
  public submissions$ = this.submissionsSubject.asObservable();
  private nextId = 1;
  
  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private productService: ProductService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      try {
        const savedSubmissions = localStorage.getItem('cardSubmissions');
        if (savedSubmissions) {
          this.submissions = JSON.parse(savedSubmissions);
          this.submissionsSubject.next(this.submissions);
          
          // Find the highest ID to continue from
          if (this.submissions.length > 0) {
            const maxId = Math.max(...this.submissions.map(sub => sub.id || 0));
            this.nextId = maxId + 1;
          }
        }
      } catch (err) {
        console.warn('Failed to load submissions from localStorage:', err);
      }
    }
  }
  
  getSubmissions(): Observable<CardSubmission[]> {
    return this.submissions$;
  }
  
  getSubmission(id: number): Observable<CardSubmission | undefined> {
    return this.submissions$.pipe(
      map(submissions => submissions.find(sub => sub.id === id))
    );
  }
  
  submitCard(cardData: Partial<CardSubmission>): Observable<CardSubmission> {
    // Simulate processing delay
    return of({}).pipe(
      delay(1500),
      map(() => {
        // Generate random evaluations for the card
        const condition = this.randomCardCondition();
        const rarity = this.randomCardRarity();
        const price = this.calculatePrice(condition, rarity);
        
        const submission: CardSubmission = {
          id: this.nextId++,
          imageUrl: cardData.imageUrl || null,
          name: cardData.name || 'Unknown Card',
          description: cardData.description,
          condition: condition,
          rarity: rarity,
          estimatedPrice: price,
          status: SubmissionStatus.PENDING,
          submittedAt: new Date()
        };
        
        this.submissions.push(submission);
        this.saveSubmissions();
        
        return submission;
      })
    );
  }
  
  updateSubmissionStatus(id: number, status: SubmissionStatus): Observable<CardSubmission | undefined> {
    const submission = this.submissions.find(sub => sub.id === id);
    
    if (submission) {
      submission.status = status;
      this.saveSubmissions();
    }
    
    return of(submission);
  }

  acceptOffer(submissionId: number): Observable<boolean> {
    console.log('Accepting offer for submission ID:', submissionId);
    
    // Find the submission
    const submission = this.submissions.find(sub => sub.id === submissionId);
    
    if (!submission) {
      console.error('Submission not found with ID:', submissionId);
      return of(false);
    }
    
    console.log('Found submission:', submission.name, 'Status:', submission.status);
    
    // Update the submission status to approved
    submission.status = SubmissionStatus.APPROVED;
    this.saveSubmissions();
    
    try {
      // Create a new product from the submission
      const success = this.addCardToCollectionSync(submission);
      console.log('Added card to collection result:', success);
      return of(success);
    } catch (err) {
      console.error('Error in acceptOffer:', err);
      return of(false);
    }
  }
  
  private addCardToCollectionSync(submission: CardSubmission): boolean {
    console.log('Adding card to collection:', submission.name);
    
    try {
      // Get current products
      const products = this.productService.getProductsSync();
      
      // Find the highest product ID
      const maxId = products.length > 0 
        ? Math.max(...products.map((product: Product) => product.id)) 
        : 0;
      
      console.log('Highest existing product ID:', maxId);
      
      // Create a new product based on the submitted card
      const newProduct: Product = {
        id: maxId + 1,
        name: submission.name,
        description: this.createCardDescription(submission),
        price: this.calculateSellingPrice(submission.estimatedPrice),
        imageUrl: submission.imageUrl || undefined
      };
      
      console.log('Created new product:', newProduct);
      
      // Add to products
      const result = this.productService.addProduct(newProduct);
      console.log('Add product result:', result);
      return result;
    } catch (err) {
      console.error('Error in addCardToCollection:', err);
      return false;
    }
  }
  
  private createCardDescription(submission: CardSubmission): string {
    let desc = submission.description ? submission.description + '\n\n' : '';
    desc += `A ${submission.condition} condition ${submission.rarity} card that we purchased from a collector. `;
    desc += 'This card has been verified by our experts and is guaranteed authentic.';
    return desc;
  }
  
  private calculateSellingPrice(buyPrice: number): number {
    // Add a markup of 30-70% on the buying price
    const markup = 1.3 + (Math.random() * 0.4);
    return Math.round(buyPrice * markup * 100) / 100;
  }
  
  private randomCardCondition(): CardCondition {
    const conditions = Object.values(CardCondition);
    return conditions[Math.floor(Math.random() * conditions.length)];
  }
  
  private randomCardRarity(): CardRarity {
    const rarities = Object.values(CardRarity);
    const weights = [45, 30, 15, 8, 2]; // Probability weights for each rarity
    
    // Weighted random selection
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return rarities[i];
      }
    }
    
    return CardRarity.COMMON; // Fallback
  }
  
  private calculatePrice(condition: CardCondition, rarity: CardRarity): number {
    // Base price factors by rarity
    const rarityFactors = {
      [CardRarity.COMMON]: { min: 0.05, max: 1 },
      [CardRarity.UNCOMMON]: { min: 0.25, max: 3 },
      [CardRarity.RARE]: { min: 1, max: 15 },
      [CardRarity.MYTHIC]: { min: 5, max: 50 },
      [CardRarity.SPECIAL]: { min: 10, max: 100 }
    };
    
    // Condition multipliers
    const conditionMultipliers = {
      [CardCondition.MINT]: 1.5,
      [CardCondition.NEAR_MINT]: 1.2,
      [CardCondition.EXCELLENT]: 1.0,
      [CardCondition.GOOD]: 0.8,
      [CardCondition.LIGHT_PLAYED]: 0.6,
      [CardCondition.PLAYED]: 0.4,
      [CardCondition.POOR]: 0.2
    };
    
    const rarityRange = rarityFactors[rarity];
    const basePrice = Math.random() * (rarityRange.max - rarityRange.min) + rarityRange.min;
    const multiplier = conditionMultipliers[condition];
    
    // Add some randomness for special cards
    const specialBonus = rarity === CardRarity.SPECIAL && Math.random() < 0.1 ? 
      Math.random() * 900 + 100 : 0; // 10% chance of being worth $100-$1000 extra
    
    return Math.round((basePrice * multiplier + specialBonus) * 100) / 100;
  }
  
  private saveSubmissions(): void {
    if (this.isBrowser) {
      this.submissionsSubject.next([...this.submissions]);
      try {
        localStorage.setItem('cardSubmissions', JSON.stringify(this.submissions));
      } catch (err) {
        console.warn('Failed to save submissions to localStorage:', err);
      }
    } else {
      this.submissionsSubject.next([...this.submissions]);
    }
  }
} 