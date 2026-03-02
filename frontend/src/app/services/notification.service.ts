import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ToastrService } from 'ngx-toastr';
// import { environment } from '../../environments/environment';
export interface NotificacionDTO {
  idNotificacion: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  icono: string;
  enlace: string;
  datos: any;
  leida: boolean;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notificaciones'; // ya queda aqui q chch
  private stompClient: Client | null = null;

  // BehaviorSubject mantiene el estado global de las notificaciones para que cualquier componente lo lea
  private notificacionesSubject = new BehaviorSubject<NotificacionDTO[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  // 1. CARGAR HISTORIAL AL INICIAR SESIÓN
  cargarHistorial(idUsuario: number): void {
    console.log('Cargando notificaciones para usuario:', idUsuario);
    this.http.get<NotificacionDTO[]>(`${this.apiUrl}/usuario/${idUsuario}`).pipe(
      catchError((err) => {
        console.error('Error cargando historial de notificaciones:', err.status, err.message, err);
        return of([] as NotificacionDTO[]);
      })
    ).subscribe({
      next: (data: NotificacionDTO[]) => {
        console.log('Notificaciones recibidas:', data.length, data);
        this.notificacionesSubject.next(data);
      }
    });
  }

  // 2. CONECTAR WEBSOCKET
  conectarWebSocket(idUsuario: number): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-notificaciones'),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      console.log('WebSocket conectado');

      this.stompClient?.subscribe(`/topic/notificaciones/${idUsuario}`, (message) => {
        if (message.body) {
          const nuevaNotif: NotificacionDTO = JSON.parse(message.body);

          // Actualizamos la lista local
          const actuales = this.notificacionesSubject.value;
          this.notificacionesSubject.next([nuevaNotif, ...actuales]);

          // Mostramos el Toastr (pop-up inferior derecho)
          this.mostrarToastr(nuevaNotif);
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Error STOMP:', frame.headers['message'], frame.body);
    };

    this.stompClient.onWebSocketError = (event) => {
      console.error('Error WebSocket:', event);
    };

    this.stompClient.activate();
  }

  desconectar(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
    this.notificacionesSubject.next([]); // Limpiamos al salir
  }

  // 3. MARCAR COMO LEÍDA
  marcarComoLeida(idNotificacion: number): Observable<any> {
    // Actualizamos el backend
    const req = this.http.patch(`${this.apiUrl}/${idNotificacion}/leida`, {});

    // Actualizamos el frontend instantáneamente para buena UX
    const actuales = this.notificacionesSubject.value;
    const index = actuales.findIndex(n => n.idNotificacion === idNotificacion);
    if (index !== -1) {
      actuales[index].leida = true;
      this.notificacionesSubject.next([...actuales]);
    }
    return req;
  }

  marcarTodasComoLeidas(idUsuario: number): void {
    this.http.patch(`${this.apiUrl}/usuario/${idUsuario}/marcar-todas`, {}).subscribe(() => {
      const actualizadas = this.notificacionesSubject.value.map(n => ({...n, leida: true}));
      this.notificacionesSubject.next(actualizadas);
    });
  }

  private mostrarToastr(notif: NotificacionDTO) {
    // Colores dinámicos según el tipo
    if (notif.tipo.includes('rechazada') || notif.tipo.includes('expirar')) {
      this.toastr.error(notif.mensaje, notif.titulo);
    } else if (notif.tipo.includes('aprobada') || notif.tipo.includes('match')) {
      this.toastr.success(notif.mensaje, notif.titulo);
    } else {
      this.toastr.info(notif.mensaje, notif.titulo);
    }
  }

  get cantidadSinLeer(): number {
    return this.notificacionesSubject.value.filter(n => !n.leida).length;
  }
}
