import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjectId } from 'bson';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommitService {
  private editDataStorageString = 'inventoryEditDetails';
  private url = environment.baseUrl + 'api';

  private storedData: any = null;

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  setStoredData(data: any) {
    this.storedData = data;
    localStorage.setItem(this.editDataStorageString, JSON.stringify(data));
  }

  async updateEditDetails(tableName: string) {
    this.storedData = localStorage.getItem(this.editDataStorageString);
    if (!this.storedData) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Missing Stored Data to update edit details',
      });
      return;
    }
    this.storedData = JSON.parse(this.storedData);

    let tempData = this.storedData;
    tempData[tableName] = new ObjectId().toString();
    let res: any = await firstValueFrom(
      this.http.put(this.url + '/updateeditdetail/' + tempData._id, tempData)
    );
    if (res.acknowledged) {
      this.storedData = tempData;
      localStorage.setItem(
        this.editDataStorageString,
        JSON.stringify(tempData)
      );
    }
  }
}
