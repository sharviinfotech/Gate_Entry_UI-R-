import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormSection } from '@/components/shared/FormSection';
import { Mail, Phone, MessageSquare, ChevronDown, ChevronUp, Book, FileText, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const faqs = [
  { 
    q: 'How do I create a new gate entry?', 
    a: 'Navigate to the Inward or Outward module from the sidebar. Select the appropriate sub-module based on your requirement (With Reference PO, Without Reference, Subcontracting, etc.). Fill in the header information and item details, then click Save to create the entry.' 
  },
  { 
    q: 'How to cancel an entry?', 
    a: 'Go to the Cancel module from the sidebar. Enter the Gate Entry Number you want to cancel. Provide a reason for cancellation in the remarks field and confirm by clicking the Cancel Entry button. Note: Only entries that haven\'t been processed further can be cancelled.' 
  },
  { 
    q: 'Can I modify an existing entry?', 
    a: 'Yes, use the Change module to modify existing entries. Enter the Gate Entry Number, make the required changes in the editable fields, and save. Some fields may be locked based on the entry\'s current status.' 
  },
  { 
    q: 'How do I print a gate pass?', 
    a: 'Navigate to the Print module, enter the Gate Entry Number, and click Search. Once the entry is displayed, click the Print button to generate a printable gate pass document.' 
  },
  { 
    q: 'What is the difference between Returnable and Non-Returnable gate passes?', 
    a: 'Returnable Gate Pass (RGP) is used for materials that are expected to return (e.g., items sent for repair, testing). Non-Returnable Gate Pass (NRGP) is for permanent outward movement of materials (e.g., scrap, sales, disposals).' 
  },
  { 
    q: 'How can I generate reports?', 
    a: 'Go to the Reports module from the sidebar. Select the report type, specify the date range and other filters, then click Generate. You can export reports to Excel for further analysis.' 
  },
];

const resources = [
  { icon: Book, title: 'User Manual', description: 'Complete guide to using the Gate Entry System', link: '#' },
  { icon: Video, title: 'Video Tutorials', description: 'Step-by-step video walkthroughs', link: '#' },
  { icon: FileText, title: 'Quick Reference Card', description: 'Printable quick reference guide', link: '#' },
];

export default function HelpSupport() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'Medium',
  });

  const handleSubmitTicket = () => {
    if (!ticketForm.subject || !ticketForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Support ticket submitted successfully! We will get back to you within 24 hours.');
    setTicketForm({ subject: '', description: '', priority: 'Medium' });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Help & Support" 
        subtitle="Get help with the Gate Entry System - FAQs, resources, and contact support" 
        breadcrumbs={[{ label: 'Help & Support' }]} 
      />
      
      {/* Contact Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="enterprise-card p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-accent" />
          </div>
          <h3 className="font-semibold mb-2">Email Support</h3>
          <p className="text-sm text-muted-foreground mb-3">Get help via email</p>
          <a href="mailto:support@sharviinfotech.com" className="text-primary hover:underline text-sm font-medium">
            support@sharviinfotech.com
          </a>
        </div>
        <div className="enterprise-card p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="w-7 h-7 text-accent" />
          </div>
          <h3 className="font-semibold mb-2">Phone Support</h3>
          <p className="text-sm text-muted-foreground mb-3">Mon-Fri, 9AM-6PM IST</p>
          <a href="tel:+912212345678" className="text-primary hover:underline text-sm font-medium">
            +91 22 1234 5678
          </a>
        </div>
        <div className="enterprise-card p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-accent" />
          </div>
          <h3 className="font-semibold mb-2">Live Chat</h3>
          <p className="text-sm text-muted-foreground mb-3">Chat with our team</p>
          <Button variant="outline" size="sm" className="gap-2">
            Start Chat
          </Button>
        </div>
      </div>

      {/* Resources Section */}
      <FormSection title="Resources & Documentation">
        <div className="grid md:grid-cols-3 gap-4">
          {resources.map((resource, i) => (
            <a 
              key={i} 
              href={resource.link}
              className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <resource.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  {resource.title}
                  <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
              </div>
            </a>
          ))}
        </div>
      </FormSection>

      {/* FAQ Section */}
      <FormSection title="Frequently Asked Questions">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="rounded-lg border border-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <h4 className="font-medium text-foreground pr-4">{faq.q}</h4>
                {expandedFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {expandedFaq === i && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </FormSection>

      {/* Submit Ticket Section */}
      <FormSection title="Submit a Support Ticket">
        <div className="max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject <span className="text-destructive">*</span></label>
            <Input
              value={ticketForm.subject}
              onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
              placeholder="Brief description of your issue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description <span className="text-destructive">*</span></label>
            <Textarea
              value={ticketForm.description}
              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              placeholder="Please describe your issue in detail..."
              rows={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={ticketForm.priority}
              onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <Button onClick={handleSubmitTicket} className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Submit Ticket
          </Button>
        </div>
      </FormSection>
    </div>
  );
}