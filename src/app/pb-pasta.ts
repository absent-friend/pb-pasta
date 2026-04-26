import { Component, computed, ElementRef, inject, resource, Resource, resourceFromSnapshots, Signal, signal, viewChild, WritableSignal } from '@angular/core';
import { PersonalBest, RunParser } from './service/run-parser';
import { PastaFormatter } from './service/pasta-formatter';

@Component({
  selector: 'pb-pasta',
  templateUrl: './pb-pasta.html',
  styleUrl: './pb-pasta.scss'
})
export class PbPasta {
  /* services */
  private runParser = inject(RunParser);
  private pastaFormatter = inject(PastaFormatter);
  
  /* form inputs and intermediate values */
  private splitsFileInput: Signal<ElementRef<HTMLInputElement>> = viewChild.required('splitsFile');
  private splitsFile: WritableSignal<Blob | undefined> = signal(undefined);
  private personalBest: Resource<PersonalBest | undefined> = resource({
    params: () => ({file: this.splitsFile()}),
    loader: async ({params}) => {
      if (params.file) {
        return await this.runParser.getPersonalBest(params.file);
      }
      return undefined;
    } 
  });

  /* the main dish */
  public pasta: Resource<string | undefined> = resourceFromSnapshots(
    computed(() => {
      const pbSnapshot = this.personalBest.snapshot();
      if (pbSnapshot.status === 'resolved' && pbSnapshot.value) {
        return { status: 'resolved', value: this.pastaFormatter.makePasta(pbSnapshot.value) };
      } else if (pbSnapshot.status === 'error') {
        return pbSnapshot;
      } else {
        return { status: pbSnapshot.status, value: undefined };
      }
    })
  );

  public copyButtonText = signal('Copy');

  constructor() {
    fetch(new URL('./example.lss', window.location.href))
      .then(resp => resp.blob())
      .then(blob => this.splitsFile.set(blob))
  }

  public setFile() {
    const file = this.splitsFileInput().nativeElement.files?.[0];
    this.splitsFile.set(file);
  }

  public enableDragAndDrop(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
  }

  public droppedFile(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.splitsFileInput().nativeElement.files = files;
      this.setFile();
    }
  }

  public copyPasta(pastaBox: HTMLOutputElement) {
    navigator.clipboard.writeText(pastaBox.innerText);
    this.copyButtonText.set('Copied!');
    setTimeout(() => this.copyButtonText.set('Copy'), 5000);
  }
}
