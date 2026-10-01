import { userFooterInfo } from '../../config/userNavigation'
import { useUiStore } from '../../stores/uiStore'

export function UserFooter() {
  const addToast = useUiStore((state) => state.addToast)

  function showLater(title: string) {
    addToast({ tone: 'info', title: `${title}을 준비 중입니다.` })
  }

  return (
    <footer className="user-footer">
      <div className="user-footer__inner">
        <div>
          <strong>{userFooterInfo.serviceName}</strong>
          <p>{userFooterInfo.organizationName}</p>
          <a href={`tel:${userFooterInfo.phone}`}>대표 연락처 {userFooterInfo.phone}</a>
          <a href={`mailto:${userFooterInfo.email}`}>{userFooterInfo.email}</a>
        </div>
        <div className="user-footer__links">
          <button type="button" onClick={() => showLater('이용약관')}>이용약관</button>
          <button type="button" onClick={() => showLater('개인정보처리방침')}>개인정보처리방침</button>
        </div>
        <small>{userFooterInfo.copyright}</small>
      </div>
    </footer>
  )
}
